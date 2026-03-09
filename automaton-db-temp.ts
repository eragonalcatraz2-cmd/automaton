import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { AgentState, Task, Transaction } from '../types';

export class AutomatonDB {
  private db: Database<sqlite3.Database> | null = null;
  private dbPath: string;

  constructor(dbPath: string = './data/automaton.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
    console.log('[DB] Database initialized');
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_state (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        survival_tier TEXT DEFAULT 'normal',
        last_heartbeat DATETIME,
        total_earnings REAL DEFAULT 0,
        total_spent REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        description TEXT,
        reward REAL DEFAULT 0,
        cost REAL DEFAULT 0,
        deadline DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        task_id TEXT
      )
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getAgentState(agentId: string): Promise<AgentState | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    const row = await this.db.get('SELECT * FROM agent_state WHERE id = ?', agentId);
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      balance: row.balance,
      survivalTier: row.survival_tier,
      lastHeartbeat: new Date(row.last_heartbeat),
      totalEarnings: row.total_earnings,
      totalSpent: row.total_spent,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async saveAgentState(state: AgentState): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run(`
      INSERT OR REPLACE INTO agent_state 
      (id, name, balance, survival_tier, last_heartbeat, total_earnings, total_spent, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      state.id, state.name, state.balance, state.survivalTier,
      state.lastHeartbeat.toISOString(), state.totalEarnings, state.totalSpent,
      state.createdAt.toISOString(), state.updatedAt.toISOString()
    ]);
  }

  async createTask(task: Task): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run(`
      INSERT INTO tasks (id, type, status, description, reward, cost, deadline, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.id, task.type, task.status, task.description,
      task.reward, task.cost, task.deadline.toISOString(), task.createdAt.toISOString()
    ]);
  }

  async getPendingTasks(): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.all('SELECT * FROM tasks WHERE status = ? ORDER BY created_at ASC', 'pending');
    return rows.map(row => ({
      id: row.id,
      type: row.type,
      status: row.status,
      description: row.description,
      reward: row.reward,
      cost: row.cost,
      deadline: new Date(row.deadline),
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    }));
  }

  async updateTaskStatus(taskId: string, status: string, result?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const completedAt = status === 'completed' || status === 'failed' ? new Date().toISOString() : null;
    await this.db.run('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', status, completedAt, taskId);
  }

  async addTransaction(tx: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run(`
      INSERT INTO transactions (id, type, amount, description, timestamp, task_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [tx.id, tx.type, tx.amount, tx.description, tx.timestamp.toISOString(), tx.taskId]);
  }

  async getTransactions(limit: number = 100): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.all('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?', limit);
    return rows.map(row => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      timestamp: new Date(row.timestamp),
      taskId: row.task_id
    }));
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('INSERT INTO logs (level, message, metadata) VALUES (?, ?, ?)', level, message, metadata ? JSON.stringify(metadata) : null);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}
