import { AutomatonDB } from '../db/Database';
import { SurvivalSystem } from './Survival';
import { AgentState, HeartbeatStatus, Task } from '../types';

export interface HeartbeatConfig {
  intervalMs: number;
  maxRetries: number;
  alertThresholds: {
    balanceLow: number;
    tasksStuck: number;
    noEarningsHours: number;
  };
}

export class HeartbeatMonitor {
  private db: AutomatonDB;
  private survival: SurvivalSystem;
  private config: HeartbeatConfig;
  private agentId: string;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private onBeatCallback?: () => Promise<void>;

  constructor(
    db: AutomatonDB,
    survival: SurvivalSystem,
    agentId: string,
    config?: Partial<HeartbeatConfig>
  ) {
    this.db = db;
    this.survival = survival;
    this.agentId = agentId;
    this.config = {
      intervalMs: 60000, // 1 minute default
      maxRetries: 3,
      alertThresholds: {
        balanceLow: 50,
        tasksStuck: 5,
        noEarningsHours: 24
      },
      ...config
    };
  }

  async start(onBeat?: () => Promise<void>): Promise<void> {
    this.onBeatCallback = onBeat;
    if (this.isRunning) {
      console.log('[Heartbeat] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[Heartbeat] Started with ${this.config.intervalMs}ms interval`);
    
    // Immediate first beat
    await this.beat();
    
    // Schedule subsequent beats
    this.timer = setInterval(() => {
      this.beat().catch(err => {
        console.error('[Heartbeat] Error during beat:', err);
      });
    }, this.config.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Heartbeat] Stopped');
  }

  private async beat(): Promise<void> {
    const timestamp = new Date();
    
    // Execute callback if provided
    if (this.onBeatCallback) {
      try {
        await this.onBeatCallback();
      } catch (err) {
        console.error('[Heartbeat] Callback error:', err);
      }
    }
    
    try {
      // Get current state
      let state = await this.db.getAgentState(this.agentId);
      
      if (!state) {
        console.log('[Heartbeat] No state found, initializing...');
        state = await this.initializeAgent();
      }

      // Update heartbeat timestamp
      state.lastHeartbeat = timestamp;
      state.updatedAt = timestamp;

      // Evaluate survival status
      const evaluation = this.survival.evaluateState(state);
      
      // Check for alerts
      const alerts = await this.checkAlerts(state);

      // Get task statistics
      const pendingTasks = await this.db.getPendingTasks();
      const activeTasks = pendingTasks.filter(t => t.status === 'running');

      // Create status report
      const status: HeartbeatStatus = {
        timestamp,
        balance: state.balance,
        tier: evaluation.tier,
        activeTasks: activeTasks.length,
        pendingTasks: pendingTasks.length,
        health: this.determineHealth(evaluation, alerts)
      };

      // Log the heartbeat
      await this.db.log('info', 'Heartbeat', {
        status,
        evaluation,
        alerts,
        daysUntilBroke: evaluation.daysUntilBroke
      });

      // Update state in database
      await this.db.saveAgentState(state);

      // Handle critical situations
      if (evaluation.tier === 'dead') {
        console.error('[Heartbeat] CRITICAL: System entering dead state');
        await this.handleDeadState(state);
      } else if (evaluation.tier === 'critical') {
        console.warn('[Heartbeat] WARNING: System in critical state');
        await this.handleCriticalState(state, evaluation.recommendations);
      }

      // Print status summary
      this.printStatus(status, evaluation);

    } catch (error) {
      console.error('[Heartbeat] Beat failed:', error);
      await this.db.log('error', 'Heartbeat failed', { error: String(error) });
    }
  }

  private async initializeAgent(): Promise<AgentState> {
    const now = new Date();
    const state: AgentState = {
      id: this.agentId,
      name: 'Automaton-001',
      balance: 100.0, // Starting balance
      survivalTier: 'normal',
      lastHeartbeat: now,
      totalEarnings: 0,
      totalSpent: 0,
      createdAt: now,
      updatedAt: now
    };

    await this.db.saveAgentState(state);
    console.log(`[Heartbeat] Initialized agent: ${state.name} with $${state.balance}`);
    
    return state;
  }

  private async checkAlerts(state: AgentState): Promise<string[]> {
    const alerts: string[] = [];
    const transactions = await this.db.getTransactions(100);
    
    // Check low balance
    if (state.balance < this.config.alertThresholds.balanceLow) {
      alerts.push(`LOW_BALANCE: $${state.balance.toFixed(2)}`);
    }

    // Check for stuck tasks
    const pendingTasks = await this.db.getPendingTasks();
    const stuckTasks = pendingTasks.filter(t => {
      const hoursPending = (Date.now() - t.createdAt.getTime()) / (1000 * 60 * 60);
      return hoursPending > 24;
    });
    
    if (stuckTasks.length >= this.config.alertThresholds.tasksStuck) {
      alerts.push(`STUCK_TASKS: ${stuckTasks.length} tasks pending >24h`);
    }

    // Check earnings drought
    const recentIncome = transactions
      .filter(tx => tx.type === 'income')
      .filter(tx => {
        const hoursAgo = (Date.now() - tx.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursAgo < this.config.alertThresholds.noEarningsHours;
      });
    
    if (recentIncome.length === 0 && state.totalEarnings > 0) {
      alerts.push(`NO_EARNINGS: No income in ${this.config.alertThresholds.noEarningsHours}h`);
    }

    return alerts;
  }

  private determineHealth(
    evaluation: ReturnType<SurvivalSystem['evaluateState']>,
    alerts: string[]
  ): HeartbeatStatus['health'] {
    if (evaluation.tier === 'dead') return 'critical';
    if (evaluation.tier === 'critical') return 'critical';
    if (alerts.length > 2) return 'degraded';
    if (evaluation.tier === 'low_compute') return 'degraded';
    return 'healthy';
  }

  private async handleDeadState(state: AgentState): Promise<void> {
    console.error('╔════════════════════════════════════════╗');
    console.error('║     SYSTEM HALTED - BALANCE ZERO       ║');
    console.error('╚════════════════════════════════════════╝');
    
    await this.db.log('critical', 'System entered DEAD state', {
      balance: state.balance,
      totalEarnings: state.totalEarnings,
      totalSpent: state.totalSpent
    });

    // Stop the heartbeat
    this.stop();
  }

  private async handleCriticalState(state: AgentState, recommendations: string[]): Promise<void> {
    console.warn('╔════════════════════════════════════════╗');
    console.warn('║     CRITICAL STATE - ACTION NEEDED     ║');
    console.warn('╚════════════════════════════════════════╝');
    
    recommendations.forEach(rec => console.warn(`! ${rec}`));
    
    await this.db.log('warning', 'System in CRITICAL state', {
      balance: state.balance,
      recommendations
    });
  }

  private printStatus(status: HeartbeatStatus, evaluation: ReturnType<SurvivalSystem['evaluateState']>): void {
    const emoji = {
      healthy: '✅',
      degraded: '⚠️',
      critical: '🚨'
    };

    console.log(`\n${emoji[status.health]} [${status.timestamp.toISOString()}] Heartbeat`);
    console.log(`   Balance: $${status.balance.toFixed(2)} | Tier: ${status.tier.toUpperCase()}`);
    console.log(`   Tasks: ${status.activeTasks} active, ${status.pendingTasks} pending`);
    console.log(`   Runway: ${evaluation.daysUntilBroke} days`);
    console.log(`   Health: ${status.health.toUpperCase()}`);
    
    if (evaluation.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      evaluation.recommendations.forEach(rec => console.log(`     • ${rec}`));
    }
    console.log();
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}
