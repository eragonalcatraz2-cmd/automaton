/**
 * ReActAgentV2 - 全自动代理 v2.0
 * 集成真实区块链交互和浏览器自动化
 */

import { AutomatonDB } from '../db/Database';
import { SurvivalSystem } from './Survival';
import { HeartbeatMonitor } from './Heartbeat';
import { BlockchainExecutor } from './BlockchainExecutor';
import { BrowserAutomation } from './BrowserAutomation';
import { AirdropHunterV2 } from '../skills/AirdropHunterV2';
import { OpenSourceSponsor } from '../skills/OpenSourceSponsor';
import { OpenSourcePromoter } from '../skills/OpenSourcePromoter';
import { RevenueGenerator } from '../skills/RevenueGenerator';
import { AgentState, Task, TaskType, SkillResult, Transaction } from '../types';

export class ReActAgentV2 {
  private db: AutomatonDB;
  private survival: SurvivalSystem;
  private heartbeat: HeartbeatMonitor;
  private blockchain: BlockchainExecutor;
  private browser: BrowserAutomation;
  private airdropHunter: AirdropHunterV2;
  private openSourceSponsor: OpenSourceSponsor;
  private openSourcePromoter: OpenSourcePromoter;
  private revenueGenerator: RevenueGenerator;
  private state: AgentState | null = null;
  private isRunning: boolean = false;
  private readonly agentId: string = 'automaton-v2';
  private heartbeatCount: number = 0;

  constructor() {
    this.db = new AutomatonDB();
    this.survival = new SurvivalSystem();
    this.heartbeat = new HeartbeatMonitor(this.db, this.survival, this.agentId);
    this.blockchain = new BlockchainExecutor();
    this.browser = new BrowserAutomation();
    this.airdropHunter = new AirdropHunterV2(this.blockchain, this.browser);
    this.openSourceSponsor = new OpenSourceSponsor();
    this.openSourcePromoter = new OpenSourcePromoter(this.browser);
    this.revenueGenerator = new RevenueGenerator();
  }

  async initialize(): Promise<void> {
    console.log('[AGENT] Initializing Automaton v2.0...');
    
    await this.db.initialize();
    
    // Load or create agent state
    const loadedState = await this.db.getAgentState(this.agentId);
    this.state = loadedState || null;
    
    if (!this.state) {
      this.state = {
        id: this.agentId,
        name: 'Automaton Alpha',
        balance: 0, // Real balance starts at 0
        survivalTier: 'critical',
        lastHeartbeat: new Date(),
        totalEarnings: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.db.saveAgentState(this.state);
      console.log('[AGENT] Created new agent state');
    } else {
      console.log('[AGENT] Loaded existing agent state');
    }

    // Initialize blockchain wallets
    await this.initializeWallets();

    await this.heartbeat.start(async () => this.onHeartbeat());
    console.log('[AGENT] Agent initialized successfully');
    console.log('[AGENT] Mode: FULLY AUTONOMOUS (Real blockchain + Browser automation)');
  }

  private async initializeWallets(): Promise<void> {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable not set');
    }

    // 初始化所有链的钱包
    const chains = ['ethereum', 'sepolia', 'linea', 'scroll', 'base'];
    
    for (const chain of chains) {
      try {
        const address = await this.blockchain.initializeWallet(chain, privateKey);
        const balance = await this.blockchain.getBalance(chain);
        console.log(`[BLOCKCHAIN] ${chain}: ${address} | Balance: ${balance} wei`);
      } catch (error) {
        console.error(`[BLOCKCHAIN] Failed to initialize ${chain}:`, error.message);
      }
    }
  }

  private async onHeartbeat(): Promise<void> {
    if (!this.state) return;

    this.heartbeatCount++;
    console.log(`\n[HEARTBEAT #${this.heartbeatCount}] ${new Date().toISOString()}`);
    
    // Update heartbeat timestamp
    this.state.lastHeartbeat = new Date();
    await this.db.saveAgentState(this.state);

    // Update real balance from blockchain
    await this.updateRealBalance();

    // Evaluate survival status
    const evaluation = this.survival.evaluateState(this.state);
    
    if (evaluation.tier !== this.state.survivalTier) {
      console.log(`[TIER] Changed from ${this.state.survivalTier} to ${evaluation.tier}`);
      this.state.survivalTier = evaluation.tier;
      await this.db.saveAgentState(this.state);
    }

    // Log recommendations
    if (evaluation.recommendations.length > 0) {
      console.log('[RECOMMENDATIONS]', evaluation.recommendations.join('; '));
    }

    // === FULLY AUTONOMOUS INCOME STRATEGIES ===
    
    // Every 5 heartbeats, scan for airdrop opportunities
    if (this.heartbeatCount % 5 === 0) {
      await this.scanAirdropOpportunities();
    }
    
    // Every 10 heartbeats, evaluate and prepare projects
    if (this.heartbeatCount % 10 === 0) {
      await this.evaluateAndPrepareAirdrops();
    }
    
    // Every 15 heartbeats, execute pending airdrop tasks
    if (this.heartbeatCount % 15 === 0) {
      await this.executeAirdropTasks();
    }
    
    // Every 30 heartbeats, monitor claims
    if (this.heartbeatCount % 30 === 0) {
      await this.monitorAirdropClaims();
    }
    
    // Every 20 heartbeats, generate income tasks
    if (this.heartbeatCount % 20 === 0) {
      await this.generateIncomeTasks();
    }
    
    // Every 40 heartbeats, check npm stats and promote
    if (this.heartbeatCount % 40 === 0) {
      await this.checkAndPromoteOpenSource();
    }
    
    // Every 50 heartbeats, print comprehensive report
    if (this.heartbeatCount % 50 === 0) {
      await this.printAutonomousReport();
    }

    console.log(`[HEARTBEAT #${this.heartbeatCount}] Completed\n`);
  }

  private async updateRealBalance(): Promise<void> {
    try {
      // Get real balances from all chains
      let totalBalance = 0n;
      const chains = ['ethereum', 'sepolia', 'linea', 'scroll', 'base'];
      
      for (const chain of chains) {
        try {
          const balance = await this.blockchain.getBalance(chain);
          totalBalance += balance;
          console.log(`[BALANCE] ${chain}: ${Number(balance) / 1e18} ETH`);
        } catch (e) {
          // Chain not initialized, skip
        }
      }
      
      // Convert to ETH and update state
      const balanceInEth = Number(totalBalance) / 1e18;
      this.state!.balance = balanceInEth;
      await this.db.saveAgentState(this.state!);
      
      console.log(`[BALANCE] Total balance: ${balanceInEth.toFixed(6)} ETH`);
    } catch (error) {
      console.error('[BALANCE] Failed to update:', error.message);
    }
  }

  private async scanAirdropOpportunities(): Promise<void> {
    console.log('[STRATEGY] Scanning for airdrop opportunities...');
    
    try {
      const newProjects = await this.airdropHunter.scanForAirdrops();
      
      if (newProjects.length > 0) {
        console.log(`[AIRDROP] Discovered ${newProjects.length} new opportunities:`);
        for (const project of newProjects) {
          console.log(`  → ${project.name}: $${project.potentialReward} (${project.difficulty})`);
        }
      } else {
        console.log('[AIRDROP] No new opportunities found');
      }
    } catch (error) {
      console.error('[AIRDROP] Scan failed:', error.message);
    }
  }

  private async evaluateAndPrepareAirdrops(): Promise<void> {
    console.log('[STRATEGY] Evaluating airdrop opportunities...');
    
    try {
      const selected = await this.airdropHunter.evaluateAndSelect();
      
      for (const project of selected) {
        console.log(`[PREPARE] Preparing project: ${project.name}`);
        const result = await this.airdropHunter.prepareProject(project);
        
        if (result.success) {
          console.log(`[PREPARE] ✓ ${project.name} ready for execution`);
        } else {
          console.error(`[PREPARE] ✗ ${project.name} preparation failed:`, result.output);
        }
      }
    } catch (error) {
      console.error('[PREPARE] Evaluation failed:', error.message);
    }
  }

  private async executeAirdropTasks(): Promise<void> {
    console.log('[EXECUTE] Executing pending airdrop tasks...');
    
    // Get projects in executing status
    const projects = Array.from((this.airdropHunter as any).projects.values())
      .filter((p: any) => p.status === 'executing') as any[];
    
    for (const project of projects) {
      console.log(`[EXECUTE] Processing: ${project.name}`);
      const result = await this.airdropHunter.executeProjectSteps(project as any);
      
      if (result.success) {
        console.log(`[EXECUTE] ✓ ${project.name} completed`);
        // Record earnings
        this.state!.totalEarnings += project.potentialReward;
        await this.db.saveAgentState(this.state!);
      } else {
        console.error(`[EXECUTE] ✗ ${project.name} failed:`, result.output);
      }
    }
  }

  private async monitorAirdropClaims(): Promise<void> {
    console.log('[MONITOR] Checking for claimable airdrops...');
    await this.airdropHunter.monitorAirdropClaims();
  }

  private async generateIncomeTasks(): Promise<void> {
    console.log('[REVENUE] Generating income tasks...');
    const tasks = await this.revenueGenerator.generateIncomeTasks();
    
    for (const task of tasks) {
      console.log(`[REVENUE] Task: ${task.title} - Potential: $${task.reward}`);
    }
  }

  private async checkAndPromoteOpenSource(): Promise<void> {
    console.log('[OPENSOURCE] Checking npm stats and generating promotion...');
    
    // 检查 npm 下载统计
    const statsResult = await this.openSourcePromoter.checkNpmStats();
    if (statsResult.success) {
      console.log(`[OPENSOURCE] ${statsResult.output}`);
    }
    
    // 生成推广内容
    const content = this.openSourcePromoter.generatePromotionalContent();
    console.log('[OPENSOURCE] Generated promotional content for Twitter, Reddit, Dev.to');
    
    // 这里可以自动发布到社交平台（需要配置账号）
  }

  private async printAutonomousReport(): Promise<void> {
    const airdropReport = this.airdropHunter.generateReport();
    const revenueReport = this.revenueGenerator.generateReport();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║           AUTONOMOUS OPERATION REPORT v2.0               ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Heartbeats:       ${this.heartbeatCount.toString().padEnd(36)} ║`);
    console.log(`║  Real Balance:     ${this.state?.balance.toFixed(6).padEnd(36)} ║`);
    console.log(`║  Survival Tier:    ${(this.state?.survivalTier || 'unknown').padEnd(36)} ║`);
    console.log(`║                                                          ║`);
    console.log(`║  💰 REVENUE STREAMS:                                     ║`);
    console.log(`║    Active Streams: ${revenueReport.activeStreams.toString().padEnd(36)} ║`);
    console.log(`║    Total Earnings: $${revenueReport.totalEarnings.toString().padEnd(35)} ║`);
    console.log(`║    Monthly Potential: $${revenueReport.potentialMonthly.toString().padEnd(32)} ║`);
    console.log(`║    Progress to $100: ${revenueReport.progress.toFixed(1)}%${''.padEnd(29)} ║`);
    console.log(`║                                                          ║`);
    console.log(`║  🎯 AIRDROPS:                                            ║`);
    console.log(`║    Discovered:     ${airdropReport.totalDiscovered.toString().padEnd(36)} ║`);
    console.log(`║    Active:         ${airdropReport.activeProjects.toString().padEnd(36)} ║`);
    console.log(`║    Completed:      ${airdropReport.completedProjects.toString().padEnd(36)} ║`);
    console.log(`║    Potential:      $${airdropReport.totalPotentialValue.toString().padEnd(35)} ║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');
  }

  async start(): Promise<void> {
    this.isRunning = true;
    console.log('[AGENT] Started in fully autonomous mode');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.heartbeat.stop();
    console.log('[AGENT] Stopped');
  }

  getStatus(): { running: boolean; balance: number; tier: string } {
    return {
      running: this.isRunning,
      balance: this.state?.balance || 0,
      tier: this.state?.survivalTier || 'unknown'
    };
  }
}
