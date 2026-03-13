/**
 * OpenSourcePromoter - 开源项目自动推广模块
 * 自动推广 npm 包，增加下载量和赞助
 */
import { BrowserAutomation } from '../core/BrowserAutomation';
import { Task, SkillResult } from '../types';
export interface PromotionChannel {
    name: string;
    type: 'social' | 'forum' | 'blog';
    url: string;
    requiresAuth: boolean;
}
export declare class OpenSourcePromoter {
    private browser;
    private packageName;
    private githubUrl;
    private npmUrl;
    constructor(browser: BrowserAutomation);
    /**
     * 生成推广内容
     */
    generatePromotionalContent(): {
        twitter: string;
        reddit: string;
        devto: string;
        github: string;
    };
    /**
     * 检查 npm 下载统计
     */
    checkNpmStats(): Promise<SkillResult>;
    /**
     * 生成推广任务
     */
    generatePromotionTasks(): Promise<Task[]>;
    /**
     * 更新 GitHub README
     */
    updateGithubReadme(): Promise<SkillResult>;
    /**
     * 生成收入报告
     */
    generateReport(): {
        packageName: string;
        npmUrl: string;
        githubUrl: string;
        weeklyDownloads: number;
        estimatedMonthlyRevenue: number;
        pendingTasks: number;
    };
}
//# sourceMappingURL=OpenSourcePromoter.d.ts.map