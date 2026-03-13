// FirstStep v3.0 - SQLite Database Manager
import Database from 'better-sqlite3';
import type { TurnRecord, IncomeRecord, TaskRecord, MetricRecord } from '../types';

const DB_PATH = process.env.FIRSTSTEP_DB || '/opt/firststep/data/firststep.db';

export class DatabaseManager {
  private db: Database.Database;
  
  constructor(dbPath: string = DB_PATH) {
    this.db = new Database(dbPath);
    this.initTables();
  }
  
  private initTables(): void {
    // Turns table - Agent conversation history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS turns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT
      )
    `);
    
    // Income table - All income records
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        channel TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        chain TEXT,
        tx_hash TEXT,
        status TEXT DEFAULT 'pending',
        metadata TEXT
      )
    `);
    
    // Tasks table - Task queue and history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        scheduled_at DATETIME,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        data TEXT,
        result TEXT,
        completed_at DATETIME
      )
    `);
    
    // Heartbeat table - Heartbeat execution log
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS heartbeats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        task TEXT NOT NULL,
        status TEXT NOT NULL,
        duration_ms INTEGER,
        error TEXT
      )
    `);
    
    // Metrics table - System metrics history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        memory_used_mb INTEGER NOT NULL,
        memory_total_mb INTEGER NOT NULL,
        cpu_percent REAL NOT NULL,
        disk_used_gb REAL NOT NULL,
        disk_total_gb REAL NOT NULL
      )
    `);
    
    // KV store - Key-value storage
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_income_channel ON income(channel)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_income_timestamp ON income(timestamp)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_heartbeats_task ON heartbeats(task)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)`);
    
    console.log('[Database] Tables initialized');
  }
  
  // Turn operations
  insertTurn(role: string, content: string, metadata?: any): number {
    const stmt = this.db.prepare(
      'INSERT INTO turns (role, content, metadata) VALUES (?, ?, ?)'
    );
    const result = stmt.run(role, content, metadata ? JSON.stringify(metadata) : null);
    return result.lastInsertRowid as number;
  }
  
  getRecentTurns(limit: number = 10): TurnRecord[] {
    const stmt = this.db.prepare(
      'SELECT * FROM turns ORDER BY timestamp DESC LIMIT ?'
    );
    return stmt.all(limit) as TurnRecord[];
  }
  
  // Income operations
  insertIncome(record: Omit<IncomeRecord, 'id' | 'timestamp'>): number {
    const stmt = this.db.prepare(
      'INSERT INTO income (channel, amount, currency, chain, tx_hash, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      record.channel,
      record.amount,
      record.currency,
      record.chain || null,
      record.tx_hash || null,
      record.status,
      record.metadata ? JSON.stringify(record.metadata) : null
    );
    return result.lastInsertRowid as number;
  }
  
  getIncome24h(): { total: number; count: number } {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM income
      WHERE timestamp > datetime('now', '-1 day')
      AND status = 'success'
    `);
    return stmt.get() as { total: number; count: number };
  }
  
  getIncomeByChannel(days: number = 7): Record<string, number> {
    const stmt = this.db.prepare(`
      SELECT channel, SUM(amount) as total
      FROM income
      WHERE timestamp > datetime('now', '-? days')
      AND status = 'success'
      GROUP BY channel
    `);
    const rows = stmt.all(days) as Array<{ channel: string; total: number }>;
    return Object.fromEntries(rows.map(r => [r.channel, r.total]));
  }
  
  // Task operations
  insertTask(task: Omit<TaskRecord, 'id' | 'created_at'>): number {
    const stmt = this.db.prepare(
      'INSERT INTO tasks (scheduled_at, type, status, priority, data) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      task.scheduled_at || null,
      task.type,
      task.status,
      task.priority,
      task.data ? JSON.stringify(task.data) : null
    );
    return result.lastInsertRowid as number;
  }
  
  getPendingTasks(limit: number = 10): TaskRecord[] {
    const stmt = this.db.prepare(
      'SELECT * FROM tasks WHERE status = ? ORDER BY priority ASC, created_at ASC LIMIT ?'
    );
    return stmt.all('pending', limit) as TaskRecord[];
  }
  
  updateTaskStatus(id: number, status: string, result?: any): void {
    const stmt = this.db.prepare(
      'UPDATE tasks SET status = ?, result = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(status, result ? JSON.stringify(result) : null, id);
  }
  
  // Heartbeat operations
  logHeartbeat(task: string, status: string, durationMs?: number, error?: string): void {
    const stmt = this.db.prepare(
      'INSERT INTO heartbeats (task, status, duration_ms, error) VALUES (?, ?, ?, ?)'
    );
    stmt.run(task, status, durationMs || null, error || null);
  }
  
  getHeartbeatStats(hours: number = 24): { success: number; failure: number } {
    const stmt = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failure
      FROM heartbeats
      WHERE timestamp > datetime('now', '-? hours')
    `);
    return stmt.get(hours) as { success: number; failure: number };
  }
  
  // Metrics operations
  insertMetric(metric: Omit<MetricRecord, 'id' | 'timestamp'>): void {
    const stmt = this.db.prepare(
      'INSERT INTO metrics (memory_used_mb, memory_total_mb, cpu_percent, disk_used_gb, disk_total_gb) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(
      metric.memory_used_mb,
      metric.memory_total_mb,
      metric.cpu_percent,
      metric.disk_used_gb,
      metric.disk_total_gb
    );
  }
  
  getLatestMetrics(): MetricRecord | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 1'
    );
    return stmt.get() as MetricRecord | undefined;
  }
  
  // KV operations
  setKV(key: string, value: string): void {
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run(key, value);
  }
  
  getKV(key: string): string | undefined {
    const stmt = this.db.prepare('SELECT value FROM kv WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row?.value;
  }
  
  close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbManager: DatabaseManager | null = null;

export function getDatabaseManager(dbPath?: string): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager(dbPath);
  }
  return dbManager;
}