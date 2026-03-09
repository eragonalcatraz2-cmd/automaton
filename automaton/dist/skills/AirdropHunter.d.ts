/**
 * AirdropHunter - 空投狩猎模块
 * 监控、分析和自动化参与加密货币空投
 */
import { SkillResult } from '../types';
export interface AirdropProject {
    id: string;
    name: string;
    chain: string;
    stage: 'testnet' | 'mainnet' | 'announced';
    potentialReward: number;
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: string[];
    steps: AirdropStep[];
    source: string;
    discoveredAt: Date;
}
export interface AirdropStep {
    order: number;
    action: string;
    description: string;
    completed: boolean;
    cost: number;
}
export interface Wallet {
    address: string;
    chain: string;
    interactions: Interaction[];
}
export interface Interaction {
    projectId: string;
    stepId: string;
    timestamp: Date;
    txHash?: string;
    status: 'pending' | 'completed' | 'failed';
}
export declare class AirdropHunter {
    private projects;
    private wallets;
    private readonly SOURCES;
    /**
     * 扫描空投机会
     */
    scanForAirdrops(): Promise<AirdropProject[]>;
    /**
     * 获取高价值空投机会
     */
    getHighValueOpportunities(minPotential?: number): AirdropProject[];
    /**
     * 计算参与空投的成本
     */
    calculateParticipationCost(project: AirdropProject): number;
    /**
     * 执行任务（参与空投）
     */
    executeAirdropTask(project: AirdropProject): Promise<SkillResult>;
    /**
     * 获取或创建钱包
     */
    private getOrCreateWallet;
    /**
     * 生成收入报告
     */
    generateReport(): {
        totalProjects: number;
        completedProjects: number;
        totalPotentialValue: number;
        walletCount: number;
    };
}
//# sourceMappingURL=AirdropHunter.d.ts.map