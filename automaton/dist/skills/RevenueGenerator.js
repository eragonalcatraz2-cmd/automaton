"use strict";
/**
 * RevenueGenerator - 收入生成策略模块
 * 多种收入来源的自动化管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueGenerator = void 0;
class RevenueGenerator {
    constructor() {
        this.streams = new Map();
        this.totalEarnings = 0;
        this.initializeStreams();
    }
    initializeStreams() {
        // 空投狩猎（全自动）
        this.streams.set('airdrop-hunting', {
            id: 'airdrop-hunting',
            name: 'Airdrop Hunting',
            type: 'airdrop',
            potentialMonthly: 500,
            effortLevel: 'low',
            automationLevel: 'full',
            status: 'active'
        });
        // 开源赞助（半自动）
        this.streams.set('opensource-sponsor', {
            id: 'opensource-sponsor',
            name: 'Open Source Sponsorship',
            type: 'opensource',
            potentialMonthly: 50,
            effortLevel: 'medium',
            automationLevel: 'partial',
            status: 'active'
        });
        // 内容创作（半自动）
        this.streams.set('content-creation', {
            id: 'content-creation',
            name: 'Technical Content Creation',
            type: 'content',
            potentialMonthly: 100,
            effortLevel: 'medium',
            automationLevel: 'partial',
            status: 'pending'
        });
        // 联盟营销（全自动）
        this.streams.set('affiliate-marketing', {
            id: 'affiliate-marketing',
            name: 'Affiliate Marketing',
            type: 'affiliate',
            potentialMonthly: 30,
            effortLevel: 'low',
            automationLevel: 'full',
            status: 'pending'
        });
    }
    /**
     * 评估当前收入策略
     */
    evaluateStrategy() {
        const active = Array.from(this.streams.values()).filter(s => s.status === 'active');
        const potential = active.reduce((sum, s) => sum + s.potentialMonthly, 0);
        const recommendations = [];
        // 根据当前状态生成建议
        if (active.length < 2) {
            recommendations.push('Activate more revenue streams to diversify income');
        }
        if (this.totalEarnings < 10) {
            recommendations.push('Focus on quick wins: airdrops and npm package downloads');
        }
        if (this.streams.get('content-creation')?.status !== 'active') {
            recommendations.push('Start content creation for long-term passive income');
        }
        return {
            activeStreams: active.length,
            totalPotential: potential,
            currentMonthEarnings: this.totalEarnings,
            recommendations
        };
    }
    /**
     * 生成收入任务
     */
    async generateIncomeTasks() {
        const tasks = [];
        const evaluation = this.evaluateStrategy();
        // 如果收入低，优先执行快速收益任务
        if (this.totalEarnings < 50) {
            tasks.push({
                id: `quick-win-${Date.now()}`,
                type: 'income',
                title: 'Execute Quick Win Strategy',
                description: 'Focus on high-probability, low-effort income sources',
                reward: 50,
                cost: 0,
                status: 'pending',
                createdAt: new Date(),
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        }
        // 为每个活跃的收入流生成任务
        for (const stream of this.streams.values()) {
            if (stream.status === 'active') {
                tasks.push(this.createStreamTask(stream));
            }
        }
        return tasks;
    }
    createStreamTask(stream) {
        const deadlines = {
            'low': 7,
            'medium': 14,
            'high': 30
        };
        return {
            id: `${stream.id}-${Date.now()}`,
            type: stream.type,
            title: `Execute ${stream.name} Strategy`,
            description: `Automated execution of ${stream.name} for potential $${stream.potentialMonthly}/month`,
            reward: stream.potentialMonthly / 4, // 周收入估算
            cost: 0,
            status: 'pending',
            createdAt: new Date(),
            deadline: new Date(Date.now() + (deadlines[stream.effortLevel] || 7) * 24 * 60 * 60 * 1000)
        };
    }
    /**
     * 记录收入
     */
    recordEarnings(source, amount) {
        this.totalEarnings += amount;
        console.log(`[Revenue] Earned $${amount} from ${source}. Total: $${this.totalEarnings}`);
    }
    /**
     * 生成收入报告
     */
    generateReport() {
        const active = Array.from(this.streams.values()).filter(s => s.status === 'active');
        const potential = active.reduce((sum, s) => sum + s.potentialMonthly, 0);
        const milestone = 100;
        const progress = Math.min((this.totalEarnings / milestone) * 100, 100);
        return {
            totalEarnings: this.totalEarnings,
            activeStreams: active.length,
            potentialMonthly: potential,
            streams: Array.from(this.streams.values()),
            nextMilestone: milestone,
            progress
        };
    }
    /**
     * 激活收入流
     */
    activateStream(streamId) {
        const stream = this.streams.get(streamId);
        if (stream) {
            stream.status = 'active';
            console.log(`[Revenue] Activated stream: ${stream.name}`);
            return true;
        }
        return false;
    }
    /**
     * 暂停收入流
     */
    pauseStream(streamId) {
        const stream = this.streams.get(streamId);
        if (stream) {
            stream.status = 'paused';
            console.log(`[Revenue] Paused stream: ${stream.name}`);
            return true;
        }
        return false;
    }
}
exports.RevenueGenerator = RevenueGenerator;
//# sourceMappingURL=RevenueGenerator.js.map