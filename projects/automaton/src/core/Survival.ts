import { AgentState, SurvivalTier, Task } from '../types';

/**
 * 生存系统 - 核心机制
 * 根据余额自动调整能力等级
 */
export class SurvivalSystem {
  private state: AgentState;
  private readonly TIERS = {
    normal: { threshold: 50, maxConcurrentTasks: 5 },
    low_compute: { threshold: 20, maxConcurrentTasks: 2 },
    critical: { threshold: 10, maxConcurrentTasks: 1 },
    dead: { threshold: 0, maxConcurrentTasks: 0 }
  };

  constructor(initialBalance: number = 100) {
    this.state = {
      id: this.generateId(),
      name: 'Jarvis-Automaton',
      balance: initialBalance,
      survivalTier: 'normal',
      lastHeartbeat: new Date(),
      totalEarnings: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 检查并更新生存等级
   */
  checkSurvivalTier(): SurvivalTier {
    const balance = this.state.balance;
    let newTier: SurvivalTier = 'dead';

    if (balance >= this.TIERS.normal.threshold) {
      newTier = 'normal';
    } else if (balance >= this.TIERS.low_compute.threshold) {
      newTier = 'low_compute';
    } else if (balance >= this.TIERS.critical.threshold) {
      newTier = 'critical';
    }

    if (newTier !== this.state.survivalTier) {
      console.log(`[Survival] Tier changed: ${this.state.survivalTier} -> ${newTier}`);
      this.state.survivalTier = newTier;
      this.onTierChange(newTier);
    }

    return newTier;
  }

  /**
   * 等级变化时的处理
   */
  private onTierChange(tier: SurvivalTier): void {
    switch (tier) {
      case 'normal':
        console.log('[Survival] Full capabilities restored.');
        break;
      case 'low_compute':
        console.log('[Survival] Entering low compute mode. Shedding non-essential tasks.');
        break;
      case 'critical':
        console.log('[Survival] CRITICAL: Emergency conservation mode. Seeking revenue urgently.');
        break;
      case 'dead':
        console.log('[Survival] DEAD: Insufficient funds. Shutting down.');
        this.shutdown();
        break;
    }
  }

  /**
   * 增加收入
   */
  addIncome(amount: number, description: string): void {
    this.state.balance += amount;
    this.state.totalEarnings += amount;
    this.state.updatedAt = new Date();
    console.log(`[Income] +$${amount} | ${description} | Balance: $${this.state.balance.toFixed(2)}`);
    this.checkSurvivalTier();
  }

  /**
   * 记录支出
   */
  addExpense(amount: number, description: string): boolean {
    if (this.state.balance < amount) {
      console.log(`[Expense] FAILED: Insufficient funds for ${description}`);
      return false;
    }

    this.state.balance -= amount;
    this.state.totalSpent += amount;
    this.state.updatedAt = new Date();
    console.log(`[Expense] -$${amount} | ${description} | Balance: $${this.state.balance.toFixed(2)}`);
    this.checkSurvivalTier();
    return true;
  }

  /**
   * 获取当前状态
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * 获取最大并发任务数
   */
  getMaxConcurrentTasks(): number {
    return this.TIERS[this.state.survivalTier].maxConcurrentTasks;
  }

  /**
   * 是否处于危险状态
   */
  isInDanger(): boolean {
    return this.state.survivalTier === 'critical' || this.state.survivalTier === 'dead';
  }

  /**
   * 计算预计存活时间（天）
   */
  calculateSurvivalDays(dailyBurnRate: number = 10): number {
    if (dailyBurnRate <= 0) return Infinity;
    return Math.floor(this.state.balance / dailyBurnRate);
  }

  /**
   * 生成报告
   */
  generateReport(): string {
    const tier = this.state.survivalTier;
    const days = this.calculateSurvivalDays();
    
    return `
╔════════════════════════════════════════╗
║         AUTOMATON 生存报告              ║
╠════════════════════════════════════════╣
║ 名称: ${this.state.name.padEnd(30)} ║
║ 余额: $${this.state.balance.toFixed(2).padEnd(29)} ║
║ 等级: ${tier.toUpperCase().padEnd(30)} ║
║ 预估存活: ${(days === Infinity ? '∞' : days + '天').padEnd(26)} ║
╠════════════════════════════════════════╣
║ 总收入: $${this.state.totalEarnings.toFixed(2).padEnd(27)} ║
║ 总支出: $${this.state.totalSpent.toFixed(2).padEnd(27)} ║
║ 净利润: $${(this.state.totalEarnings - this.state.totalSpent).toFixed(2).padEnd(27)} ║
╚════════════════════════════════════════╝
`;
  }

  /**
   * 关机处理
   */
  private shutdown(): void {
    console.log('[System] Automaton is shutting down due to insufficient funds.');
    console.log('[System] To revive, add funds and restart.');
    process.exit(0);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return 'auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
