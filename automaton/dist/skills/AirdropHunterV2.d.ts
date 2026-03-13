/**
 * AirdropHunterV2 - 全自动空投狩猎模块
 * 零人工干预，自动发现、准备、执行、监控
 */
import { BlockchainExecutor } from '../core/BlockchainExecutor';
import { BrowserAutomation } from '../core/BrowserAutomation';
import { SkillResult } from '../types';
export interface AirdropProject {
    id: string;
    name: string;
    chain: string;
    stage: 'testnet' | 'mainnet' | 'announced';
    potentialReward: number;
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: Requirement[];
    steps: AirdropStep[];
    source: string;
    discoveredAt: Date;
    status: 'discovered' | 'preparing' | 'executing' | 'completed' | 'claimed';
}
export interface Requirement {
    type: 'wallet' | 'balance' | 'social' | 'kyc';
    chain?: string;
    minBalance?: string;
    description: string;
}
export interface AirdropStep {
    order: number;
    type: 'bridge' | 'swap' | 'mint' | 'deploy' | 'social' | 'form' | 'wait';
    description: string;
    params: Record<string, any>;
    completed: boolean;
    txHash?: string;
    executedAt?: Date;
}
export declare class AirdropHunterV2 {
    private blockchain;
    private browser;
    private projects;
    private activeProjects;
    constructor(blockchain: BlockchainExecutor, browser: BrowserAutomation);
    /**
     * 扫描空投机会（通过 API + 爬虫）
     */
    scanForAirdrops(): Promise<AirdropProject[]>;
    private readonly CONTRACTS;
    private fetchFromSource;
    /**
     * 评估并选择要参与的空投
     */
    evaluateAndSelect(): Promise<AirdropProject[]>;
    /**
     * 准备参与空投（获取资金、配置钱包）
     */
    prepareProject(project: AirdropProject): Promise<SkillResult>;
    /**
     * 执行空投任务步骤
     */
    executeProjectSteps(project: AirdropProject): Promise<SkillResult>;
    /**
     * 监控空投领取状态
     */
    monitorAirdropClaims(): Promise<void>;
    /**
     * 生成收入报告
     */
    generateReport(): {
        totalDiscovered: number;
        activeProjects: number;
        completedProjects: number;
        totalPotentialValue: number;
        totalGasSpent: number;
    };
}
//# sourceMappingURL=AirdropHunterV2.d.ts.map