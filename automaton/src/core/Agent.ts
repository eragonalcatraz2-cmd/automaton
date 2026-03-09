import { AutomatonDB } from '../db/Database';
import { SurvivalSystem } from './Survival';
import { HeartbeatMonitor } from './Heartbeat';
import { AirdropHunter } from '../skills/AirdropHunter';
import { OpenSourceSponsor } from '../skills/OpenSourceSponsor';
import { AgentState, Task, TaskType, SkillResult, Transaction } from '../types';

export class ReActAgent {
  private db: AutomatonDB;
  private survival: SurvivalSystem;
  private heartbeat: HeartbeatMonitor;
  private airdropHunter: AirdropHunter;
  private openSourceSponsor: OpenSourceSponsor;
  private state: AgentState | null = null;
  private isRunning: boolean = false;
  private readonly agentId: string = 'automaton-v1';
  private heartbeatCount: number = 0;

  constructor() {
    this.db = new AutomatonDB();
    this.survival = new SurvivalSystem();
    this.heartbeat = new HeartbeatMonitor(this.db, this.survival, this.agentId);
    this.airdropHunter = new AirdropHunter();
    this.openSourceSponsor = new OpenSourceSponsor();
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
    
    // Load or create agent state
    const loadedState = await this.db.getAgentState(this.agentId);
    this.state = loadedState || null;
    
    if (!this.state) {
      this.state = {
        id: this.agentId,
        name: 'Automaton Alpha',
        balance: 100.0, // Starting capital (simulation mode)
        survivalTier: 'normal',
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

    await this.heartbeat.start(async () => this.onHeartbeat());
    console.log('[AGENT] Agent initialized successfully');
    console.log('[AGENT] Zero-capital mode: Airdrop hunting + Open Source');
  }

  private async onHeartbeat(): Promise<void> {
    if (!this.state) return;

    this.heartbeatCount++;
    console.log(`[HEARTBEAT #${this.heartbeatCount}] Running scheduled check...`);
    
    // Update heartbeat timestamp
    this.state.lastHeartbeat = new Date();
    await this.db.saveAgentState(this.state);

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

    // === ZERO-CAPITAL INCOME STRATEGIES ===
    
    // Every 5 heartbeats, scan for airdrop opportunities
    if (this.heartbeatCount % 5 === 0) {
      await this.scanAirdropOpportunities();
    }
    
    // Every 10 heartbeats, check open source opportunities
    if (this.heartbeatCount % 10 === 0) {
      await this.discoverOpenSourceOpportunities();
    }
    
    // Every 20 heartbeats, print comprehensive report
    if (this.heartbeatCount % 20 === 0) {
      await this.printZeroCapitalReport();
    }

    // Check for pending tasks
    const pendingTasks = await this.db.getPendingTasks();
    
    if (pendingTasks.length === 0 && evaluation.tier !== 'critical' && evaluation.tier !== 'dead') {
      // Generate new income opportunity
      await this.generateIncomeOpportunity();
    }

    // Execute highest priority task
    if (pendingTasks.length > 0 && this.isRunning) {
      const executableTasks = pendingTasks.filter(t => 
        this.survival.shouldExecuteTask(this.state!, t.reward, t.cost)
      );

      if (executableTasks.length > 0) {
        // Sort by priority
        executableTasks.sort((a, b) => 
          this.survival.calculateTaskPriority(b.reward, b.cost, b.deadline) -
          this.survival.calculateTaskPriority(a.reward, a.cost, a.deadline)
        );

        await this.executeTask(executableTasks[0]);
      } else {
        console.log('[TASKS] No affordable tasks in current tier');
      }
    }

    // Emergency mode: if critical and no pending work, try harder
    if (evaluation.tier === 'critical' && pendingTasks.length === 0) {
      console.log('[EMERGENCY] Critical mode - generating emergency task');
      await this.generateEmergencyTask();
    }
  }

  /**
   * Scan for airdrop opportunities (zero capital strategy)
   */
  private async scanAirdropOpportunities(): Promise<void> {
    console.log('[STRATEGY] Scanning for airdrop opportunities...');
    
    const newProjects = await this.airdropHunter.scanForAirdrops();
    const highValue = this.airdropHunter.getHighValueOpportunities(100);
    
    if (highValue.length > 0) {
      console.log(`[AIRDROP] Found ${highValue.length} high-value opportunities!`);
      highValue.forEach(p => {
        console.log(`  → ${p.name}: Potential $${p.potentialReward} (difficulty: ${p.difficulty})`);
      });
      
      // Create task for the best opportunity
      const best = highValue[0];
      const task: Task = {
        id: `airdrop-${best.id}`,
        type: 'research',
        status: 'pending',
        description: `Participate in ${best.name} airdrop (potential: $${best.potentialReward})`,
        reward: best.potentialReward,
        cost: this.airdropHunter.calculateParticipationCost(best),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date()
      };
      
      await this.db.createTask(task);
      console.log(`[AIRDROP] Created task: ${task.description}`);
    }
  }

  /**
   * Discover open source opportunities (zero capital strategy)
   */
  private async discoverOpenSourceOpportunities(): Promise<void> {
    console.log('[STRATEGY] Discovering open source opportunities...');
    
    const newProjects = await this.openSourceSponsor.discoverOpportunities();
    const bestOpportunities = this.openSourceSponsor.getBestOpportunities();
    
    if (bestOpportunities.length > 0) {
      console.log(`[OPENSOURCE] Found ${bestOpportunities.length} project ideas`);
      
      // Create task for the best project
      const best = bestOpportunities[0];
      const task: Task = {
        id: `oss-${best.id}`,
        type: 'code',
        status: 'pending',
        description: `Develop open source project: ${best.name}`,
        reward: 50, // Estimated monthly potential
        cost: 0,    // Zero cost to develop
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        createdAt: new Date()
      };
      
      await this.db.createTask(task);
      console.log(`[OPENSOURCE] Created task: ${task.description}`);
    }
  }

  /**
   * Print comprehensive zero-capital report
   */
  private async printZeroCapitalReport(): Promise<void> {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           ZERO-CAPITAL INCOME REPORT                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    // Airdrop report
    const airdropReport = this.airdropHunter.generateReport();
    console.log('\n📊 Airdrop Hunting:');
    console.log(`   Projects tracked: ${airdropReport.totalProjects}`);
    console.log(`   Completed: ${airdropReport.completedProjects}`);
    console.log(`   Total potential value: $${airdropReport.totalPotentialValue}`);
    console.log(`   Wallets managed: ${airdropReport.walletCount}`);
    
    // Open Source report
    const ossReport = this.openSourceSponsor.generateReport();
    console.log('\n💻 Open Source:');
    console.log(`   Project ideas: ${ossReport.totalProjects}`);
    console.log(`   Published: ${ossReport.publishedProjects}`);
    console.log(`   Total stars: ${ossReport.totalStars}`);
    console.log(`   Total sponsors: ${ossReport.totalSponsors}`);
    console.log(`   Monthly income: $${ossReport.monthlyIncome.toFixed(2)}`);
    
    // Recommended platforms
    console.log('\n🏦 Recommended Sponsor Platforms:');
    ossReport.platforms.slice(0, 3).forEach(p => {
      console.log(`   → ${p.name} (fee: ${p.fee}%, difficulty: ${p.setupDifficulty})`);
    });
    
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('   1. Create crypto wallet for airdrop participation');
    console.log('   2. Setup GitHub account with Sponsors enabled');
    console.log('   3. Configure Buy Me a Coffee / Ko-fi account');
    
    console.log('\n════════════════════════════════════════════════════════════\n');
  }

  private async generateIncomeOpportunity(): Promise<void> {
    console.log('[INCOME] Generating new income opportunity...');

    // Mix of traditional and zero-capital opportunities
    const opportunities: Array<{ type: TaskType; description: string; reward: number; cost: number }> = [
      { type: 'content', description: 'Generate SEO blog post', reward: 5.0, cost: 0.5 },
      { type: 'code', description: 'Create automation script', reward: 10.0, cost: 1.0 },
      { type: 'data', description: 'Data analysis report', reward: 8.0, cost: 0.8 },
      { type: 'research', description: 'Market research summary', reward: 6.0, cost: 0.6 },
      { type: 'social', description: 'Social media content batch', reward: 4.0, cost: 0.4 },
      // Zero-capital opportunities
      { type: 'research', description: 'Research and document new airdrop opportunity', reward: 100.0, cost: 0.1 },
      { type: 'code', description: 'Build and publish open source tool', reward: 50.0, cost: 0.0 }
    ];

    const selected = opportunities[Math.floor(Math.random() * opportunities.length)];
    
    const task: Task = {
      id: `task-${Date.now()}`,
      type: selected.type,
      status: 'pending',
      description: selected.description,
      reward: selected.reward,
      cost: selected.cost,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date()
    };

    await this.db.createTask(task);
    console.log(`[TASK] Created: ${task.description} (reward: $${task.reward}, cost: $${task.cost})`);
  }

  private async generateEmergencyTask(): Promise<void> {
    const emergencyTask: Task = {
      id: `emergency-${Date.now()}`,
      type: 'content',
      status: 'pending',
      description: 'EMERGENCY: Quick content generation for immediate payment',
      reward: 3.0,
      cost: 0.2,
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      createdAt: new Date()
    };

    await this.db.createTask(emergencyTask);
    console.log(`[EMERGENCY] Created emergency task: ${emergencyTask.description}`);
  }

  private async executeTask(task: Task): Promise<void> {
    if (!this.state) return;

    console.log(`[EXECUTE] Starting task: ${task.description}`);
    await this.db.updateTaskStatus(task.id, 'running');

    // Deduct cost
    this.state.balance -= task.cost;
    this.state.totalSpent += task.cost;
    await this.db.saveAgentState(this.state);

    // Record expense
    await this.db.addTransaction({
      id: `tx-expense-${Date.now()}`,
      type: 'expense',
      amount: task.cost,
      description: `Cost for task: ${task.description}`,
      timestamp: new Date(),
      taskId: task.id
    });

    // Execute based on task type
    let result: SkillResult;
    
    if (task.id.startsWith('airdrop-')) {
      // Execute airdrop task
      const projectId = task.id.replace('airdrop-', '');
      const project = Array.from(this.airdropHunter['projects'].values())
        .find(p => p.id === projectId);
      if (project) {
        result = await this.airdropHunter.executeAirdropTask(project);
      } else {
        result = { success: false, output: '', error: 'Project not found' };
      }
    } else if (task.id.startsWith('oss-')) {
      // Execute open source task
      const projectId = task.id.replace('oss-', '');
      const project = this.openSourceSponsor['projects'].get(projectId);
      if (project) {
        result = await this.openSourceSponsor.developProject(project);
        if (result.success) {
          // Also promote the project
          await this.openSourceSponsor.promoteProject(project);
        }
      } else {
        result = { success: false, output: '', error: 'Project not found' };
      }
    } else {
      // Default simulation
      result = await this.simulateTaskExecution(task);
    }

    if (result.success) {
      // Add reward
      this.state.balance += task.reward;
      this.state.totalEarnings += task.reward;
      await this.db.saveAgentState(this.state);

      // Record income
      await this.db.addTransaction({
        id: `tx-income-${Date.now()}`,
        type: 'income',
        amount: task.reward,
        description: `Reward for: ${task.description}`,
        timestamp: new Date(),
        taskId: task.id
      });

      await this.db.updateTaskStatus(task.id, 'completed');
      console.log(`[SUCCESS] Task completed! Earned $${task.reward}, net profit $${task.reward - task.cost}`);
    } else {
      await this.db.updateTaskStatus(task.id, 'failed');
      console.log(`[FAILED] Task failed. Lost $${task.cost}`);
    }
  }

  private async simulateTaskExecution(task: Task): Promise<SkillResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 80% success rate for simulation
    const success = Math.random() > 0.2;
    
    return {
      success,
      output: success ? `Completed ${task.type} task successfully` : '',
      error: success ? undefined : 'Simulated failure'
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[AGENT] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[AGENT] Started in ZERO-CAPITAL mode');
    console.log('[AGENT] Strategies: Airdrop hunting + Open Source');
    
    // Run initial heartbeat
    await this.onHeartbeat();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.heartbeat.stop();
    await this.db.close();
    console.log('[AGENT] Stopped');
  }

  getStatus(): { running: boolean; state: AgentState | null } {
    return {
      running: this.isRunning,
      state: this.state
    };
  }
}
