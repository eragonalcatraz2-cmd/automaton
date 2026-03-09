/**
 * BrowserAutomation - 浏览器自动化模块
 * 用于处理需要浏览器交互的任务（水龙头、社交任务、KYC等）
 */
import { SkillResult } from '../types';
export interface BrowserTask {
    id: string;
    type: 'faucet' | 'social' | 'form' | 'captcha';
    url: string;
    steps: BrowserStep[];
    walletAddress?: string;
}
export interface BrowserStep {
    action: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot' | 'solveCaptcha';
    selector?: string;
    value?: string;
    delay?: number;
}
export declare class BrowserAutomation {
    private isAvailable;
    constructor();
    private checkAvailability;
    /**
     * 执行浏览器任务
     */
    executeTask(task: BrowserTask): Promise<SkillResult>;
    private executeStep;
    /**
     * 请求水龙头（浏览器自动化版本）
     */
    requestFaucet(faucetUrl: string, walletAddress: string): Promise<SkillResult>;
    /**
     * 执行社交任务（Twitter/X）
     */
    executeSocialTask(platform: 'twitter' | 'discord' | 'telegram', action: 'follow' | 'retweet' | 'like' | 'join', target: string): Promise<SkillResult>;
}
//# sourceMappingURL=BrowserAutomation.d.ts.map