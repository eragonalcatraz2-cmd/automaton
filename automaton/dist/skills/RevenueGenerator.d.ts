/**
 * RevenueGenerator - 收入生成策略模块
 * 多种收入来源的自动化管理
 */
import { Task } from '../types';
export interface RevenueStream {
    id: string;
    name: string;
    type: 'airdrop' | 'opensource' | 'freelance' | 'content' | 'affiliate';
    potentialMonthly: number;
    effortLevel: 'low' | 'medium' | 'high';
    automationLevel: 'full' | 'partial' | 'manual';
    status: 'active' | 'paused' | 'pending';
}
export declare class RevenueGenerator {
    private streams;
    private totalEarnings;
    constructor();
    private initializeStreams;
    /**
     * 评估当前收入策略
     */
    evaluateStrategy(): {
        activeStreams: number;
        totalPotential: number;
        currentMonthEarnings: number;
        recommendations: string[];
    };
    /**
     * 生成收入任务
     */
    generateIncomeTasks(): Promise<Task[]>;
    private createStreamTask;
    /**
     * 记录收入
     */
    recordEarnings(source: string, amount: number): void;
    /**
     * 生成收入报告
     */
    generateReport(): {
        totalEarnings: number;
        activeStreams: number;
        potentialMonthly: number;
        streams: RevenueStream[];
        nextMilestone: number;
        progress: number;
    };
    /**
     * 激活收入流
     */
    activateStream(streamId: string): boolean;
    /**
     * 暂停收入流
     */
    pauseStream(streamId: string): boolean;
}
//# sourceMappingURL=RevenueGenerator.d.ts.map