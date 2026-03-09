import { AgentState, SurvivalTier } from '../types';
export interface TierConfig {
    name: SurvivalTier;
    maxDailyTasks: number;
    apiBudget: number;
    computePriority: 'high' | 'medium' | 'low';
    canAcceptNewWork: boolean;
}
export declare class SurvivalSystem {
    private tiers;
    private readonly TIER_THRESHOLDS;
    private readonly DAILY_COST_ESTIMATE;
    getTierFromBalance(balance: number): SurvivalTier;
    getTierConfig(tier: SurvivalTier): TierConfig;
    evaluateState(state: AgentState): {
        tier: SurvivalTier;
        daysUntilBroke: number;
        recommendations: string[];
        urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
    };
    shouldExecuteTask(state: AgentState, taskReward: number, taskCost: number): boolean;
    calculateTaskPriority(taskReward: number, taskCost: number, deadline: Date): number;
}
//# sourceMappingURL=Survival.d.ts.map