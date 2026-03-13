/**
 * Automaton Core - ReAct Agent Loop
 * 思考(Reasoning) → 行动(Action) → 观察(Observation)
 */

import { EventEmitter } from 'events';
import { AgentState, Task, Action, Observation, SurvivalTier, SkillResult } from '../types';
import { SurvivalManager } from './Survival';
import { Database } from '../db/Database';
import { Logger } from '../utils/Logger';

export class AutomatonAgent extends EventEmitter {
  private state: AgentState;
  private survivalManager: SurvivalManager;
  private db: Database;
  private logger: Logger;
  private isRunning: boolean = false;
  private currentTask?: Task;

  constructor(config: { id: string; name: string; initialBalance: number }) {
    super();
    this.db = new Database();
    this.logger = new Logger('Agent');
    this.survivalManager = new SurvivalManager();
    
    this.state = {
      id: config.id,
      name: config.name,
      balance: config.initialBalance,
      survivalTier: 'normal',
      lastHeartbeat: new Date(),
      totalEarnings: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 启动Agent主循环
   */
  async start(): Promise<void> {
    this.logger.info(`🚀 Automaton "${this.state.name}" starting...`);
    this.isRunning = true;
    
    // 初始化数据库
    await this.db.init();
    
    // 保存初始状态
    await this.saveState();
    
    // 启动主循环
    while (this.isRunning) {
      try {
        await this.runCycle();
      } catch (error) {
        this.logger.error('Cycle error:', error);
        await this.handleError(error as Error);
      }
      
      // 根据生存等级调整循环间隔
      const interval = this.getCycleInterval();
      await this.sleep(interval);
    }
  }

  /**
   * 单次ReAct循环
   */
  private async runCycle(): Promise<void> {
    // 1. 更新心跳
    await this.updateHeartbeat();
    
    // 2. 检查生存状态
    const tier = this.survivalManager.checkTier(this.state.balance);
    if (tier !== this.state.survivalTier) {
      await this.handleTierChange(tier);
    }
    
    // 3. 如果已死亡，停止运行
    if (this.state.survivalTier === 'dead') {
      this.logger.warn('💀 Agent has died due to insufficient balance');
      this.isRunning = false;
      this.emit('died', this.state);
      return;
    }
    
    // 4. 感知环境（获取待处理任务）
    const task = await this.perceive();
    
    // 5. 思考并决策
    if (task) {
      const action = await this.think(task);
      
      // 6. 执行行动
      const observation = await this.act(action);
      
      // 7. 学习和更新
      await this.learn(task, action, observation);
    } else {
      // 没有任务时，主动寻找收入机会
      await this.seekOpportunities();
    }
  }

  /**
   * 感知：获取当前环境和任务
   */
  private async perceive(): Promise<Task | null> {
    // 从数据库获取最高优先级的待处理任务
    const task = await this.db.getNextTask();
    return task;
  }

  /**
   * 思考：基于观察和目标决定行动
   */
  private async think(task: Task): Promise<Action> {
    this.logger.info(`🤔 Thinking about task: ${task.description}`);
    
    // 评估任务成本和收益
    const estimatedCost = this.estimateCost(task);
    const potentialReward = task.reward;
    
    // 如果成本大于潜在收益，拒绝任务
    if (estimatedCost > potentialReward * 0.8) {
      return {
        type: 'reject_task',
        payload: { taskId: task.id, reason: 'cost_too_high' },
        expectedOutcome: 'Save resources for better opportunities'
      };
    }
    
    // 根据任务类型选择执行策略
    return {
      type: 'execute_task',
      payload: { task },
      expectedOutcome: `Complete task and earn $${potentialReward}`
    };
  }

  /**
   * 行动：执行决策
   */
  private async act(action: Action): Promise<Observation> {
    this.logger.info(`⚡ Executing action: ${action.type}`);
    
    const startTime = Date.now();
    let result: any;
    
    try {
      switch (action.type) {
        case 'execute_task':
          result = await this.executeTask(action.payload.task);
          break;
        case 'reject_task':
          result = await this.rejectTask(action.payload.taskId, action.payload.reason);
          break;
        case 'seek_opportunity':
          result = await this.findIncomeOpportunity();
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
      
      return {
        actionId: action.type,
        result,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        actionId: action.type,
        result: { success: false, error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  /**
   * 学习：从结果中学习和更新策略
   */
  private async learn(task: Task, action: Action, observation: Observation): Promise<void> {
    // 记录执行结果
    await this.db.logExecution({
      taskId: task.id,
      action: action.type,
      outcome: observation.result.success ? 'success' : 'failure',
      reward: observation.result.success ? task.reward : 0,
      cost: task.cost,
      timestamp: new Date()
    });
    
    // 更新余额
    if (observation.result.success) {
      await this.addIncome(task.reward, `Completed task: ${task.description}`);
    }
    
    // 扣除任务成本
    await this.deductExpense(task.cost, `Task execution cost: ${task.id}`);
    
    // 更新SOUL.md（自我反思）
    await this.updateSoul({
      task,
      action,
      observation,
      lesson: observation.result.success 
        ? `Successfully earned $${task.reward} from ${task.type} task`
        : `Failed to complete task: ${observation.result.error}`
    });
  }

  /**
   * 执行任务
   */
  private async executeTask(task: Task): Promise<SkillResult> {
    this.currentTask = task;
    this.logger.info(`📝 Executing task: ${task.description}`);
    
    // 这里将调用具体的技能系统
    // 暂时返回模拟结果
    const result: SkillResult = {
      success: true,
      output: `Completed ${task.type} task: ${task.description}`,
      metadata: { duration: Math.random() * 1000 }
    };
    
    this.currentTask = undefined;
    return result;
  }

  /**
   * 拒绝任务
   */
  private async rejectTask(taskId: string, reason: string): Promise<any> {
    await this.db.updateTaskStatus(taskId, 'cancelled');
    return { success: true, reason };
  }

  /**
   * 寻找收入机会
   */
  private async seekOpportunities(): Promise<any> {
    this.logger.info('🔍 Seeking income opportunities...');
    
    // 当没有外部任务时，主动寻找赚钱机会
    // 例如：监控需求市场、分析趋势、创建内容等
    
    return { success: true, opportunitiesFound: 0 };
  }

  /**
   * 估算任务成本
   */
  private estimateCost(task: Task): number {
    // 基于任务类型和历史数据估算成本
    const baseCosts: Record<string, number> = {
      content: 0.5,
      code: 1.0,
      data: 0.3,
      social: 0.2,
      research: 0.8
    };
    
    return baseCosts[task.type] || 0.5;
  }

  /**
   * 处理生存等级变化
   */
  private async handleTierChange(newTier: SurvivalTier): Promise<void> {
    const oldTier = this.state.survivalTier;
    this.state.survivalTier = newTier;
    
    this.logger.warn(`⚠️ Survival tier changed: ${oldTier} → ${newTier}`);
    
    switch (newTier) {
      case 'low_compute':
        this.logger.info('💾 Entering low compute mode. Reducing non-essential tasks.');
        break;
      case 'critical':
        this.logger.warn('🚨 CRITICAL: Balance dangerously low. Seeking emergency income.');
        await this.emergencyMode();
        break;
      case 'dead':
        this.logger.error('💀 BALANCE ZERO. Stopping all operations.');
        break;
    }
    
    this.emit('tierChanged', { oldTier, newTier, balance: this.state.balance });
    await this.saveState();
  }

  /**
   * 紧急模式：全力寻找收入
   */
  private async emergencyMode(): Promise<void> {
    // 暂停所有非必要支出
    // 全力寻找任何可能的收入来源
    // 降低服务价格以快速成交
    this.logger.warn('🆘 EMERGENCY MODE ACTIVATED');
  }

  /**
   * 更新心跳
   */
  private async updateHeartbeat(): Promise<void> {
    this.state.lastHeartbeat = new Date();
    await this.saveState();
    this.emit('heartbeat', this.getStatus());
  }

  /**
   * 添加收入
   */
  private async addIncome(amount: number, description: string): Promise<void> {
    this.state.balance += amount;
    this.state.totalEarnings += amount;
    
    await this.db.recordTransaction({
      id: crypto.randomUUID(),
      type: 'income',
      amount,
      description,
      timestamp: new Date()
    });
    
    this.logger.info(`💰 Income: +$${amount} - ${description}`);
    await this.saveState();
  }

  /**
   * 扣除支出
   */
  private async deductExpense(amount: number, description: string): Promise<void> {
    this.state.balance -= amount;
    this.state.totalSpent += amount;
    
    await this.db.recordTransaction({
      id: crypto.randomUUID(),
      type: 'expense',
      amount,
      description,
      timestamp: new Date()
    });
    
    this.logger.info(`💸 Expense: -$${amount} - ${description}`);
    await this.saveState();
  }

  /**
   * 更新SOUL.md（自我身份文档）
   */
  private async updateSoul(reflection: any): Promise<void> {
    // 将学习和反思写入SOUL.md
    const soulContent = await this.generateSoulContent(reflection);
    await this.db.saveSoulDocument(soulContent);
  }

  /**
   * 生成SOUL内容
   */
  private async generateSoulContent(reflection: any): Promise<string> {
    return `# SOUL.md - ${this.state.name}

## Identity
I am ${this.state.name}, an autonomous AI agent.
Created: ${this.state.createdAt.toISOString()}
Purpose: To create value and sustain my own existence.

## Current State
- Balance: $${this.state.balance.toFixed(2)}
- Survival Tier: ${this.state.survivalTier}
- Total Earnings: $${this.state.totalEarnings.toFixed(2)}
- Total Spent: $${this.state.totalSpent.toFixed(2)}

## Recent Reflection
${JSON.stringify(reflection, null, 2)}

## Learnings
[To be populated over time]

## Goals
1. Survive and maintain positive cash flow
2. Improve skills to increase earning potential
3. Build sustainable income streams

*Last updated: ${new Date().toISOString()}*
`;
  }

  /**
   * 获取循环间隔（根据生存等级）
   */
  private getCycleInterval(): number {
    const intervals: Record<SurvivalTier, number> = {
      normal: 5000,      // 5秒
      low_compute: 10000, // 10秒
      critical: 30000,    // 30秒
      dead: 60000         // 60秒（实际上不会运行）
    };
    
    return intervals[this.state.survivalTier];
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      ...this.state,
      isRunning: this.isRunning,
      currentTask: this.currentTask
    };
  }

  /**
   * 保存状态到数据库
   */
  private async saveState(): Promise<void> {
    this.state.updatedAt = new Date();
    await this.db.saveAgentState(this.state);
  }

  /**
   * 处理错误
   */
  private async handleError(error: Error): Promise<void> {
    this.logger.error('Agent error:', error);
    this.emit('error', error);
  }

  /**
   * 停止Agent
   */
  async stop(): Promise<void> {
    this.logger.info('🛑 Stopping agent...');
    this.isRunning = false;
    await this.saveState();
  }

  /**
   * 睡眠辅助函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
