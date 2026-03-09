"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurvivalSystem = void 0;
class SurvivalSystem {
    constructor() {
        this.tiers = new Map([
            ['normal', {
                    name: 'normal',
                    maxDailyTasks: 50,
                    apiBudget: 10.0,
                    computePriority: 'high',
                    canAcceptNewWork: true
                }],
            ['low_compute', {
                    name: 'low_compute',
                    maxDailyTasks: 20,
                    apiBudget: 3.0,
                    computePriority: 'medium',
                    canAcceptNewWork: true
                }],
            ['critical', {
                    name: 'critical',
                    maxDailyTasks: 5,
                    apiBudget: 0.5,
                    computePriority: 'low',
                    canAcceptNewWork: false
                }],
            ['dead', {
                    name: 'dead',
                    maxDailyTasks: 0,
                    apiBudget: 0,
                    computePriority: 'low',
                    canAcceptNewWork: false
                }]
        ]);
        this.TIER_THRESHOLDS = {
            normal: 100, // > $100 = normal
            low_compute: 50, // $50-100 = low_compute
            critical: 10, // $10-50 = critical
            dead: 0 // < $10 = dead (but > 0)
        };
        this.DAILY_COST_ESTIMATE = 2.0; // Estimated daily operating cost
    }
    getTierFromBalance(balance) {
        if (balance <= 0)
            return 'dead';
        if (balance < this.TIER_THRESHOLDS.critical)
            return 'critical';
        if (balance < this.TIER_THRESHOLDS.low_compute)
            return 'low_compute';
        return 'normal';
    }
    getTierConfig(tier) {
        return this.tiers.get(tier);
    }
    evaluateState(state) {
        const currentTier = this.getTierFromBalance(state.balance);
        const daysUntilBroke = Math.floor(state.balance / this.DAILY_COST_ESTIMATE);
        const recommendations = [];
        let urgency = 'none';
        switch (currentTier) {
            case 'normal':
                if (daysUntilBroke < 30) {
                    recommendations.push('Start building emergency fund');
                    urgency = 'low';
                }
                break;
            case 'low_compute':
                recommendations.push('Reduce non-essential API calls');
                recommendations.push('Focus on high-reward tasks only');
                recommendations.push('Consider pausing experimental features');
                urgency = 'medium';
                break;
            case 'critical':
                recommendations.push('EMERGENCY: Only execute revenue-generating tasks');
                recommendations.push('Pause all non-essential operations');
                recommendations.push('Request emergency funding or shutdown gracefully');
                urgency = 'critical';
                break;
            case 'dead':
                recommendations.push('SYSTEM HALTED: Balance depleted');
                recommendations.push('Manual intervention required to restart');
                urgency = 'critical';
                break;
        }
        return {
            tier: currentTier,
            daysUntilBroke,
            recommendations,
            urgency
        };
    }
    shouldExecuteTask(state, taskReward, taskCost) {
        const evaluation = this.evaluateState(state);
        const config = this.getTierConfig(evaluation.tier);
        // In critical mode, only accept profitable tasks
        if (evaluation.tier === 'critical') {
            return taskReward > taskCost * 2; // Must be 2x profitable
        }
        // In dead mode, nothing runs
        if (evaluation.tier === 'dead') {
            return false;
        }
        // Check if we have budget for this task
        if (taskCost > config.apiBudget) {
            return false;
        }
        return true;
    }
    calculateTaskPriority(taskReward, taskCost, deadline) {
        const profit = taskReward - taskCost;
        const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
        const urgencyBonus = hoursUntilDeadline < 24 ? 100 : 0;
        return profit + urgencyBonus;
    }
}
exports.SurvivalSystem = SurvivalSystem;
//# sourceMappingURL=Survival.js.map