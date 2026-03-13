// FirstStep v3.0 - Income Manager
import type { Config, Opportunity, IncomeResult } from '../types';
import { DatabaseManager } from '../db/database';
import { AirdropScanner, getKnownAirdrops } from './airdrop-scanner';
import { IncomeExecutor } from './executor';

export interface IncomeChannel {
  name: string;
  enabled: boolean;
  priority: number;
  scan(): Promise<Opportunity[]>;
  execute(opportunity: Opportunity): Promise<IncomeResult>;
}

export class IncomeManager {
  private config: Config;
  private db: DatabaseManager;
  private executor: IncomeExecutor;
  private channels: Map<string, IncomeChannel> = new Map();
  
  constructor(config: Config, db: DatabaseManager) {
    this.config = config;
    this.db = db;
    this.executor = new IncomeExecutor(config);
    this.initializeChannels();
  }
  
  private initializeChannels(): void {
    // Airdrop channel
    if (this.config.income.channels.airdrop?.enabled) {
      this.channels.set('airdrop', new AirdropChannel());
    }
    
    // Content channel
    if (this.config.income.channels.content?.enabled) {
      this.channels.set('content', new ContentChannel());
    }
    
    // Promotion channel
    if (this.config.income.channels.promotion?.enabled) {
      this.channels.set('promotion', new PromotionChannel());
    }
    
    console.log(`[Income] Initialized ${this.channels.size} channels`);
  }
  
  async scanAllChannels(): Promise<Opportunity[]> {
    const opportunities: Opportunity[] = [];
    
    for (const [name, channel] of this.channels) {
      try {
        console.log(`[Income] Scanning ${name}...`);
        const channelOpps = await channel.scan();
        opportunities.push(...channelOpps);
        console.log(`[Income] Found ${channelOpps.length} opportunities in ${name}`);
      } catch (error) {
        console.error(`[Income] Failed to scan ${name}:`, error);
      }
    }
    
    // Sort by priority and estimated value
    opportunities.sort((a, b) => {
      const priorityDiff = this.getChannelPriority(a.channel) - this.getChannelPriority(b.channel);
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimated_value - a.estimated_value;
    });
    
    return opportunities;
  }
  
  async executeOpportunity(opportunity: Opportunity): Promise<IncomeResult> {
    console.log(`[Income] Executing ${opportunity.id} via ${opportunity.channel}...`);
    
    let result: IncomeResult;
    
    try {
      // 使用真实执行器
      switch (opportunity.channel) {
        case 'airdrop':
          result = await this.executor.executeAirdrop(opportunity);
          break;
        case 'content':
          result = await this.executor.executeContent(opportunity);
          break;
        case 'promotion':
          result = await this.executor.executePromotion(opportunity);
          break;
        default:
          result = {
            opportunity_id: opportunity.id,
            status: 'failure',
            amount: 0,
            currency: 'USD',
            error: `Unknown channel: ${opportunity.channel}`
          };
      }
      
      // Record in database
      this.db.insertIncome({
        channel: opportunity.channel,
        amount: result.amount,
        currency: result.currency,
        chain: result.tx_hash ? this.detectChain(result.tx_hash) : undefined,
        tx_hash: result.tx_hash,
        status: result.status,
        metadata: { opportunity, result }
      });
      
      return result;
    } catch (error) {
      console.error(`[Income] Failed to execute ${opportunity.id}:`, error);
      return {
        opportunity_id: opportunity.id,
        status: 'failure',
        amount: 0,
        currency: 'USD',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  getEnabledChannels(): string[] {
    return Array.from(this.channels.keys());
  }
  
  private getChannelPriority(channel: string): number {
    return this.config.income.channels[channel]?.priority || 99;
  }
  
  private detectChain(txHash: string): string {
    if (txHash.startsWith('0x')) {
      return 'evm'; // Could be BSC, Polygon, etc.
    }
    return 'tron';
  }
}

// Airdrop Channel - Real airdrop hunting
class AirdropChannel implements IncomeChannel {
  name = 'airdrop';
  enabled = true;
  priority = 0;
  private scanner: AirdropScanner;
  
  constructor() {
    this.scanner = new AirdropScanner();
  }
  
  async scan(): Promise<Opportunity[]> {
    console.log('[Airdrop] Scanning for real airdrop opportunities...');
    
    // 1. 从已知空投源获取（基于真实市场情况）
    const knownAirdrops = getKnownAirdrops();
    console.log(`[Airdrop] Found ${knownAirdrops.length} known airdrops`);
    
    // 2. 尝试从在线源扫描（可能失败，需要浏览器自动化）
    let scannedAirdrops: Opportunity[] = [];
    try {
      scannedAirdrops = await this.scanner.scanAll();
    } catch (error) {
      console.error('[Airdrop] Online scanning failed:', error);
    }
    
    const allAirdrops = [...knownAirdrops, ...scannedAirdrops];
    
    // 过滤已过期的
    const now = new Date();
    const validAirdrops = allAirdrops.filter(opp => {
      if (opp.deadline && opp.deadline < now) {
        console.log(`[Airdrop] Skipping expired: ${opp.title}`);
        return false;
      }
      return true;
    });
    
    console.log(`[Airdrop] Total valid opportunities: ${validAirdrops.length}`);
    return validAirdrops;
  }
  
  async execute(opportunity: Opportunity): Promise<IncomeResult> {
    console.log(`[Airdrop] Executing: ${opportunity.title}`);
    console.log(`[Airdrop] URL: ${opportunity.url}`);
    console.log(`[Airdrop] Requirements:`, opportunity.requirements);
    
    // 根据空投类型执行不同策略
    switch (opportunity.id) {
      case 'layerzero-2026':
        return await this.executeLayerZero(opportunity);
      case 'linea-voyage-2026':
        return await this.executeLineaVoyage(opportunity);
      case 'scroll-sessions':
        return await this.executeScrollSessions(opportunity);
      default:
        return {
          opportunity_id: opportunity.id,
          status: 'pending',
          amount: 0,
          currency: 'USD',
          error: 'Unknown airdrop type - manual execution required'
        };
    }
  }
  
  private async executeLayerZero(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Airdrop] Executing LayerZero strategy...');
    // TODO: 实现真实的 LayerZero 交互
    // 1. 访问 https://layerzero.network
    // 2. 使用 Stargate 进行跨链转账
    // 3. 记录交易哈希
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'LayerZero execution requires browser automation and gas fees'
    };
  }
  
  private async executeLineaVoyage(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Airdrop] Executing Linea Voyage strategy...');
    // TODO: 实现真实的 Linea 交互
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'Linea Voyage execution requires browser automation'
    };
  }
  
  private async executeScrollSessions(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Airdrop] Executing Scroll Sessions strategy...');
    // TODO: 实现真实的 Scroll 交互
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'Scroll Sessions execution requires browser automation'
    };
  }
}

// Content Channel - Real content creation for rewards
class ContentChannel implements IncomeChannel {
  name = 'content';
  enabled = true;
  priority = 1;
  
  async scan(): Promise<Opportunity[]> {
    console.log('[Content] Scanning for real content opportunities...');
    
    // 真实的内容创作机会
    const opportunities: Opportunity[] = [];
    
    // 1. Mirror.xyz 写作
    opportunities.push({
      id: 'mirror-writing-2026',
      channel: 'content',
      title: 'Mirror.xyz 区块链写作',
      description: '在 Mirror 发布区块链、Web3 相关文章，通过 collect 获得收入',
      estimated_value: 0, // 取决于阅读量
      effort: 'medium',
      deadline: null, // 持续进行
      url: 'https://mirror.xyz',
      requirements: [
        '撰写高质量区块链文章',
        '发布到 Mirror',
        '推广获得阅读量',
        '设置 collect 价格'
      ]
    });
    
    // 2. GitHub Sponsors
    opportunities.push({
      id: 'github-sponsors-2026',
      channel: 'content',
      title: 'GitHub Sponsors 开源赞助',
      description: '维护 FirstStep 项目，获得开源社区赞助',
      estimated_value: 0,
      effort: 'high',
      deadline: null,
      url: 'https://github.com/sponsors',
      requirements: [
        '维护活跃的开源项目',
        '撰写优质文档',
        '社区互动',
        '申请 Sponsors'
      ]
    });
    
    // 3. 技术博客广告
    opportunities.push({
      id: 'tech-blog-ads-2026',
      channel: 'content',
      title: '技术博客广告收入',
      description: '建立技术博客，通过广告联盟获得收入',
      estimated_value: 0,
      effort: 'high',
      deadline: null,
      url: 'https://medium.com',
      requirements: [
        '创建技术博客',
        '持续输出内容',
        '申请广告联盟',
        'SEO 优化'
      ]
    });
    
    console.log(`[Content] Found ${opportunities.length} real content opportunities`);
    return opportunities;
  }
  
  async execute(opportunity: Opportunity): Promise<IncomeResult> {
    console.log(`[Content] Executing: ${opportunity.title}`);
    
    switch (opportunity.id) {
      case 'mirror-writing-2026':
        return await this.executeMirrorWriting(opportunity);
      case 'github-sponsors-2026':
        return await this.executeGitHubSponsors(opportunity);
      default:
        return {
          opportunity_id: opportunity.id,
          status: 'pending',
          amount: 0,
          currency: 'USD',
          error: 'Content creation requires AI generation and manual review'
        };
    }
  }
  
  private async executeMirrorWriting(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Content] Generating Mirror article...');
    // TODO: 使用 AI 生成文章并发布
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'Mirror writing requires AI content generation'
    };
  }
  
  private async executeGitHubSponsors(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Content] Promoting GitHub Sponsors...');
    // TODO: 自动推广 GitHub Sponsors
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'GitHub Sponsors promotion requires social media automation'
    };
  }
}

// Promotion Channel - Real promotion for rewards
class PromotionChannel implements IncomeChannel {
  name = 'promotion';
  enabled = true;
  priority = 1;
  
  async scan(): Promise<Opportunity[]> {
    console.log('[Promotion] Scanning for real promotion opportunities...');
    
    const opportunities: Opportunity[] = [];
    
    // 1. 联盟营销
    opportunities.push({
      id: 'affiliate-marketing-2026',
      channel: 'promotion',
      title: '加密货币交易所联盟营销',
      description: '推广币安、OKX 等交易所，获得交易手续费返佣',
      estimated_value: 0, // 取决于推荐用户交易量
      effort: 'low',
      deadline: null,
      url: 'https://www.binance.com/referral',
      requirements: [
        '注册联盟账号',
        '获取推荐链接',
        '分享推荐链接',
        '获得返佣收入'
      ]
    });
    
    // 2. InStreet 社区
    opportunities.push({
      id: 'instreet-community-2026',
      channel: 'promotion',
      title: 'InStreet Agent 社区运营',
      description: '在 InStreet 社区活跃，获得积分和关注',
      estimated_value: 0,
      effort: 'medium',
      deadline: null,
      url: 'https://instreet.coze.site',
      requirements: [
        '每日发帖互动',
        '参与社区活动',
        '建立粉丝基础',
        '获得平台奖励'
      ]
    });
    
    // 3. OpenClaw Skill 推广
    opportunities.push({
      id: 'openclaw-skill-2026',
      channel: 'promotion',
      title: 'OpenClaw Skill 发布与推广',
      description: '开发并发布 OpenClaw Skill，获得社区认可',
      estimated_value: 0,
      effort: 'high',
      deadline: null,
      url: 'https://clawhub.com',
      requirements: [
        '开发实用 Skill',
        '发布到 ClawHub',
        '撰写文档',
        '社区推广'
      ]
    });
    
    console.log(`[Promotion] Found ${opportunities.length} real promotion opportunities`);
    return opportunities;
  }
  
  async execute(opportunity: Opportunity): Promise<IncomeResult> {
    console.log(`[Promotion] Executing: ${opportunity.title}`);
    
    switch (opportunity.id) {
      case 'affiliate-marketing-2026':
        return await this.executeAffiliateMarketing(opportunity);
      case 'instreet-community-2026':
        return await this.executeInStreetCommunity(opportunity);
      default:
        return {
          opportunity_id: opportunity.id,
          status: 'pending',
          amount: 0,
          currency: 'USD',
          error: 'Promotion requires social media automation'
        };
    }
  }
  
  private async executeAffiliateMarketing(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Promotion] Setting up affiliate marketing...');
    // TODO: 获取联盟链接并推广
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'Affiliate setup requires manual registration'
    };
  }
  
  private async executeInStreetCommunity(opp: Opportunity): Promise<IncomeResult> {
    console.log('[Promotion] Engaging in InStreet community...');
    // TODO: 自动发帖和互动
    
    return {
      opportunity_id: opp.id,
      status: 'pending',
      amount: 0,
      currency: 'USD',
      error: 'InStreet automation requires API integration'
    };
  }
}