// FirstStep v3.0 - Heartbeat Daemon
import type { Config, Report } from '../types';
import { DatabaseManager } from '../db/database';
import { WalletManager } from '../wallet/manager';
import { IncomeManager } from '../income/manager';
import { FeishuReporter } from '../report/feishu';

export interface HeartbeatTask {
  name: string;
  interval: number; // seconds
  enabled: boolean;
  execute: () => Promise<void>;
}

export class HeartbeatDaemon {
  private config: Config;
  private db: DatabaseManager;
  private walletManager: WalletManager;
  private incomeManager: IncomeManager;
  private reporter: FeishuReporter;
  private tasks: Map<string, HeartbeatTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  
  constructor(
    config: Config,
    db: DatabaseManager,
    walletManager: WalletManager,
    incomeManager: IncomeManager,
    reporter: FeishuReporter
  ) {
    this.config = config;
    this.db = db;
    this.walletManager = walletManager;
    this.incomeManager = incomeManager;
    this.reporter = reporter;
    this.initializeTasks();
  }
  
  private initializeTasks(): void {
    // Health check task
    this.tasks.set('health_check', {
      name: 'health_check',
      interval: this.config.heartbeat.tasks.health_check?.interval || 300,
      enabled: this.config.heartbeat.tasks.health_check?.enabled !== false,
      execute: async () => {
        console.log('[Heartbeat] Running health check...');
        
        // Record system metrics
        const memUsage = process.memoryUsage();
        const diskUsage = await this.getDiskUsage();
        
        this.db.insertMetric({
          memory_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
          memory_total_mb: this.config.memory.limit,
          cpu_percent: 0, // TODO: Get actual CPU usage
          disk_used_gb: diskUsage.used,
          disk_total_gb: diskUsage.total
        });
        
        this.db.logHeartbeat('health_check', 'success');
      }
    });
    
    // Balance check task
    this.tasks.set('balance_check', {
      name: 'balance_check',
      interval: this.config.heartbeat.tasks.balance_check?.interval || 600,
      enabled: this.config.heartbeat.tasks.balance_check?.enabled !== false,
      execute: async () => {
        console.log('[Heartbeat] Checking balances...');
        
        try {
          const balances = await this.walletManager.getAllBalances();
          console.log('[Heartbeat] Balances:', balances);
          
          // Check for low balance alerts
          const totalBalance = Object.values(balances).reduce((a: number, b: number) => a + b, 0);
          if (totalBalance < this.config.survival.thresholds.critical) {
            await this.reporter.sendAlert('critical', `余额严重不足: $${totalBalance.toFixed(2)}`);
          } else if (totalBalance < this.config.survival.thresholds.low) {
            await this.reporter.sendAlert('warning', `余额较低: $${totalBalance.toFixed(2)}`);
          }
          
          this.db.logHeartbeat('balance_check', 'success');
        } catch (error) {
          console.error('[Heartbeat] Balance check failed:', error);
          this.db.logHeartbeat('balance_check', 'failure', undefined, String(error));
        }
      }
    });
    
    // Income scan task
    this.tasks.set('income_scan', {
      name: 'income_scan',
      interval: this.config.heartbeat.tasks.income_scan?.interval || 3600,
      enabled: this.config.heartbeat.tasks.income_scan?.enabled !== false,
      execute: async () => {
        console.log('[Heartbeat] Scanning for income opportunities...');
        
        try {
          const opportunities = await this.incomeManager.scanAllChannels();
          console.log(`[Heartbeat] Found ${opportunities.length} opportunities`);
          
          // Queue high-priority opportunities as tasks
          for (const opp of opportunities.slice(0, 3)) {
            this.db.insertTask({
              type: 'income',
              status: 'pending',
              priority: this.getPriorityValue(opp.effort),
              data: opp
            });
          }
          
          this.db.logHeartbeat('income_scan', 'success');
        } catch (error) {
          console.error('[Heartbeat] Income scan failed:', error);
          this.db.logHeartbeat('income_scan', 'failure', undefined, String(error));
        }
      }
    });
    
    // Report task
    this.tasks.set('report', {
      name: 'report',
      interval: this.config.heartbeat.tasks.report?.interval || 7200,
      enabled: this.config.heartbeat.tasks.report?.enabled !== false,
      execute: async () => {
        console.log('[Heartbeat] Generating report...');
        
        try {
          const report = await this.generateReport();
          await this.reporter.sendReport(report);
          this.db.logHeartbeat('report', 'success');
        } catch (error) {
          console.error('[Heartbeat] Report generation failed:', error);
          this.db.logHeartbeat('report', 'failure', undefined, String(error));
        }
      }
    });
  }
  
  start(): void {
    if (this.isRunning) {
      console.log('[Heartbeat] Already running');
      return;
    }
    
    console.log('[Heartbeat] Starting daemon...');
    this.isRunning = true;
    
    for (const [name, task] of this.tasks) {
      if (!task.enabled) {
        console.log(`[Heartbeat] Task ${name} is disabled`);
        continue;
      }
      
      // Convert seconds to milliseconds
      const intervalMs = task.interval * 1000;
      
      // Execute immediately on start
      this.executeTask(task);
      
      // Schedule periodic execution
      const interval = setInterval(() => {
        this.executeTask(task);
      }, intervalMs);
      
      this.intervals.set(name, interval);
      console.log(`[Heartbeat] Task ${name} scheduled every ${task.interval}s`);
    }
  }
  
  stop(): void {
    console.log('[Heartbeat] Stopping daemon...');
    this.isRunning = false;
    
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`[Heartbeat] Task ${name} stopped`);
    }
    
    this.intervals.clear();
  }
  
  private async executeTask(task: HeartbeatTask): Promise<void> {
    const startTime = Date.now();
    
    try {
      await task.execute();
      const duration = Date.now() - startTime;
      console.log(`[Heartbeat] Task ${task.name} completed in ${duration}ms`);
    } catch (error) {
      console.error(`[Heartbeat] Task ${task.name} failed:`, error);
    }
  }
  
  private async generateReport(): Promise<Report> {
    const balances = await this.walletManager.getAllBalances();
    const income24h = this.db.getIncome24h();
    const pendingTasks = this.db.getPendingTasks(10);
    const metrics = this.db.getLatestMetrics();
    
    const alerts: Report['alerts'] = [];
    
    // Check memory usage
    if (metrics && metrics.memory_used_mb / metrics.memory_total_mb > 0.85) {
      alerts.push({
        level: 'warning',
        message: `内存使用率过高: ${(metrics.memory_used_mb / metrics.memory_total_mb * 100).toFixed(1)}%`,
        timestamp: new Date()
      });
    }
    
    // Check balance
    const totalBalance = Object.values(balances).reduce((a: number, b: number) => a + b, 0);
    if (totalBalance < this.config.survival.thresholds.critical) {
      alerts.push({
        level: 'critical',
        message: `余额严重不足: $${totalBalance.toFixed(2)}`,
        timestamp: new Date()
      });
    }
    
    return {
      timestamp: new Date(),
      system: {
        status: this.getSurvivalTier(totalBalance),
        uptime: process.uptime(),
        memory: {
          used: metrics?.memory_used_mb || Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: this.config.memory.limit
        }
      },
      finance: {
        balances,
        income24h: income24h.total,
        expenses24h: 0
      },
      tasks: {
        completed: 0,
        failed: 0,
        pending: pendingTasks.length
      },
      income: [],
      alerts
    };
  }
  
  private getSurvivalTier(totalBalance: number): Report['system']['status'] {
    if (totalBalance < this.config.survival.thresholds.critical) return 'critical';
    if (totalBalance < this.config.survival.thresholds.low) return 'low';
    return 'normal';
  }
  
  private getPriorityValue(effort: string): number {
    const values: Record<string, number> = { low: 1, medium: 2, high: 3 };
    return values[effort] || 2;
  }
  
  private async getDiskUsage(): Promise<{ used: number; total: number }> {
    // Simple fallback - in production would use actual disk check
    return { used: 0, total: 100 };
  }
}