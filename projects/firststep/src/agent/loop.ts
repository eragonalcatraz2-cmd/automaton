// FirstStep v3.0 - Agent Loop (ReAct)
import type { 
  Context, 
  Decision, 
  Task, 
  Result, 
  Observation,
  Report,
  Alert
} from '../types';
import { getConfig } from '../config';
import { DatabaseManager } from '../db/database';
import { IncomeManager } from '../income/manager';

export class AgentLoop {
  private context: Context;
  private db: DatabaseManager;
  private incomeManager: IncomeManager;
  private isRunning: boolean = false;
  
  constructor(
    initialContext: Context,
    db: DatabaseManager,
    incomeManager: IncomeManager
  ) {
    this.context = initialContext;
    this.db = db;
    this.incomeManager = incomeManager;
  }
  
  async run(): Promise<void> {
    this.isRunning = true;
    console.log('[Agent] Starting ReAct loop...');
    
    while (this.isRunning) {
      try {
        // Step 1: Think
        const decision = await this.think();
        
        // Step 2: Plan
        const tasks = await this.plan(decision);
        
        // Step 3: Act
        const results = await this.act(tasks);
        
        // Step 4: Observe
        const observation = await this.observe(results);
        
        // Step 5: Report (FirstStep specific)
        const report = await this.report(observation);
        
        // Step 6: Sleep
        await this.sleep();
        
      } catch (error) {
        console.error('[Agent] Loop error:', error);
        await this.handleError(error);
      }
    }
  }
  
  private async think(): Promise<Decision> {
    console.log('[Agent] Thinking...');
    
    // Analyze current context
    const { balances, survival_tier } = this.context;
    const totalBalance = Object.values(balances).reduce((a: number, b: number) => a + b, 0);
    
    // Decision logic based on survival tier
    let action: string;
    let params: Record<string, any> = {};
    
    switch (survival_tier) {
      case 'normal':
        action = 'execute_income_tasks';
        params = { channels: ['airdrop', 'content', 'promotion'] };
        break;
      case 'low':
        action = 'reduce_and_focus';
        params = { channels: ['airdrop'], aggressive: true };
        break;
      case 'critical':
        action = 'emergency_mode';
        params = { notify_owner: true, pause_non_essential: true };
        break;
      default:
        action = 'sleep';
        params = { duration: 3600 };
    }
    
    const decision: Decision = {
      action,
      params,
      reasoning: `Current balance: $${totalBalance}, tier: ${survival_tier}. ${action} is optimal.`
    };
    
    console.log(`[Agent] Decision: ${action}`);
    return decision;
  }
  
  private async plan(decision: Decision): Promise<Task[]> {
    console.log('[Agent] Planning...');
    
    const tasks: Task[] = [];
    const config = getConfig();
    
    // Generate tasks based on decision
    if (decision.action === 'execute_income_tasks') {
      const channels = decision.params.channels as string[];
      
      for (const channel of channels) {
        const channelConfig = config.income.channels[channel];
        if (channelConfig?.enabled) {
          tasks.push({
            id: `income_${channel}_${Date.now()}`,
            type: 'income',
            priority: channelConfig.priority,
            data: { channel }
          });
        }
      }
    }
    
    // Sort by priority
    tasks.sort((a, b) => a.priority - b.priority);
    
    console.log(`[Agent] Planned ${tasks.length} tasks`);
    return tasks;
  }
  
  private async act(tasks: Task[]): Promise<Result[]> {
    console.log('[Agent] Acting...');
    
    const results: Result[] = [];
    
    for (const task of tasks) {
      try {
        console.log(`[Agent] Executing task: ${task.id}`);
        
        // Task execution logic here
        // This would call the appropriate tool/manager
        const result = await this.executeTask(task);
        results.push(result);
        
      } catch (error) {
        results.push({
          task_id: task.id,
          status: 'failure',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }
  
  private async executeTask(task: Task): Promise<Result> {
    // Placeholder for actual task execution
    // Would integrate with IncomeManager, WalletManager, etc.
    
    return {
      task_id: task.id,
      status: 'success',
      data: { executed: true, timestamp: new Date() }
    };
  }
  
  private async observe(results: Result[]): Promise<Observation> {
    console.log('[Agent] Observing...');
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'failure').length;
    
    const observation: Observation = {
      results,
      summary: `Completed ${successCount}/${results.length} tasks. ${failureCount} failed.`
    };
    
    console.log(`[Agent] ${observation.summary}`);
    return observation;
  }
  
  private async report(observation: Observation): Promise<Report> {
    console.log('[Agent] Generating report...');
    
    const { balances } = this.context;
    const totalBalance = Object.values(balances).reduce((a: number, b: number) => a + b, 0);
    
    const alerts: Alert[] = [];
    
    // Generate alerts based on conditions
    if (totalBalance < 5) {
      alerts.push({
        level: 'warning',
        message: `Low balance: $${totalBalance}`,
        timestamp: new Date()
      });
    }
    
    const report: Report = {
      timestamp: new Date(),
      system: {
        status: this.context.survival_tier,
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          total: this.context.memory?.total || 2048
        }
      },
      finance: {
        balances,
        income24h: 0, // Would query from database
        expenses24h: 0
      },
      tasks: {
        completed: observation.results.filter((r: Result) => r.status === 'success').length,
        failed: observation.results.filter((r: Result) => r.status === 'failure').length,
        pending: 0
      },
      income: [], // Would query from database
      alerts
    };
    
    return report;
  }
  
  private async sleep(): Promise<void> {
    const config = getConfig();
    const sleepDuration = config.heartbeat.interval * 1000;
    
    console.log(`[Agent] Sleeping for ${config.heartbeat.interval}s...`);
    await new Promise(resolve => setTimeout(resolve, sleepDuration));
  }
  
  private async handleError(error: unknown): Promise<void> {
    console.error('[Agent] Error handled:', error);
    
    // Log to database
    // Notify owner if critical
    
    // Continue loop after error
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  stop(): void {
    this.isRunning = false;
    console.log('[Agent] Stopping loop...');
  }
  
  updateContext(context: Partial<Context>): void {
    this.context = { ...this.context, ...context };
  }
}
