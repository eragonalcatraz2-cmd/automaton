/**
 * OpenSourceSponsor - 开源项目赞助模块
 * 创建有价值的开源工具，通过 GitHub Sponsors 等获得打赏
 */
import { SkillResult } from '../types';
export interface OpenSourceProject {
    id: string;
    name: string;
    description: string;
    type: 'cli' | 'library' | 'action' | 'app';
    language: string;
    githubUrl?: string;
    stars: number;
    sponsors: number;
    monthlyIncome: number;
    status: 'idea' | 'developing' | 'published' | 'maintaining';
    createdAt: Date;
}
export interface SponsorPlatform {
    name: string;
    url: string;
    fee: number;
    setupDifficulty: 'easy' | 'medium' | 'hard';
}
export declare class OpenSourceSponsor {
    private projects;
    private readonly PLATFORMS;
    private readonly PROJECT_IDEAS;
    /**
     * 发现开源项目机会
     */
    discoverOpportunities(): Promise<OpenSourceProject[]>;
    /**
     * 获取最有潜力的项目
     */
    getBestOpportunities(): OpenSourceProject[];
    /**
     * 开发开源项目
     */
    developProject(project: OpenSourceProject): Promise<SkillResult>;
    /**
     * 推广项目
     */
    promoteProject(project: OpenSourceProject): Promise<SkillResult>;
    /**
     * 获取赞助平台推荐
     */
    getRecommendedPlatforms(): SponsorPlatform[];
    /**
     * 模拟收入（实际需要从平台 API 获取）
     */
    simulateIncome(): void;
    /**
     * 生成收入报告
     */
    generateReport(): {
        totalProjects: number;
        publishedProjects: number;
        totalStars: number;
        totalSponsors: number;
        monthlyIncome: number;
        platforms: SponsorPlatform[];
    };
}
//# sourceMappingURL=OpenSourceSponsor.d.ts.map