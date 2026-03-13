// FirstStep v3.0 - Entry Point
import { getConfig } from './config';
import { AgentLoop } from './agent/loop';
import { getMemoryController } from './memory/controller';
import { getBrowserManager } from './browser/manager';
import { DatabaseManager } from './db/database';
import { getWalletManager } from './wallet/manager';
import { IncomeManager } from './income/manager';
import { getFeishuReporter } from './report/feishu';
import { HeartbeatDaemon } from './heartbeat/daemon';
import type { Context, AgentIdentity } from './types';

class FirstStepRuntime {
  private config = getConfig();
  private agent: AgentLoop | null = null;
  private db: DatabaseManager;
  private walletManager;
  private incomeManager;
  private reporter;
  private heartbeatDaemon;
  private memoryController = getMemoryController(this.config);
  private browserManager = getBrowserManager(this.config);
  
  constructor() {
    // Initialize database first
    this.db = new DatabaseManager();
    
    // Initialize wallet manager
    this.walletManager = getWalletManager(this.config);
    
    // Initialize income manager
    this.incomeManager = new IncomeManager(this.config, this.db);
    
    // Initialize Feishu reporter
    this.reporter = getFeishuReporter(this.config);
    
    // Initialize heartbeat daemon
    this.heartbeatDaemon = new HeartbeatDaemon(
      this.config,
      this.db,
      this.walletManager,
      this.incomeManager,
      this.reporter
    );
  }
  
  async start(): Promise<void> {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║           FirstStep v3.0 Starting...           ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    // Initialize context
    const context = await this.initializeContext();
    
    // Start memory monitoring
    this.memoryController.startMonitoring(30000);
    
    // Register memory actions
    this.registerMemoryActions();
    
    // Start heartbeat daemon
    this.heartbeatDaemon.start();
    
    // Start agent loop
    this.agent = new AgentLoop(context, this.db, this.incomeManager);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    
    // Run agent
    await this.agent.run();
  }
  
  private async initializeContext(): Promise<Context> {
    console.log('[Init] Initializing context...');
    
    // Get wallet addresses
    const tronAddress = this.walletManager.getAddress('tron') || 'Not configured';
    
    const identity: AgentIdentity = {
      name: this.config.agent.name,
      version: this.config.agent.version,
      wallet_address: tronAddress,
      creator: this.config.agent.creator
    };
    
    // Get real balances from blockchain
    console.log('[Init] Querying blockchain balances...');
    const balances = await this.walletManager.getAllBalances();
    
    // Determine survival tier
    const totalBalance = Object.values(balances).reduce((a: number, b: number) => a + b, 0);
    let survival_tier: 'normal' | 'low' | 'critical' | 'paused' = 'normal';
    
    if (totalBalance < this.config.survival.thresholds.critical) {
      survival_tier = 'critical';
    } else if (totalBalance < this.config.survival.thresholds.low) {
      survival_tier = 'low';
    }
    
    console.log(`[Init] Total balance: $${totalBalance.toFixed(2)}, Tier: ${survival_tier}`);
    
    const context: Context = {
      timestamp: new Date(),
      identity,
      balances,
      survival_tier,
      conversation: [],
      tools_available: []
    };
    
    return context;
  }
  
  private registerMemoryActions(): void {
    // Register actions for memory tier changes
    this.memoryController.registerAction('reduce_tasks', async () => {
      console.log('[Action] Reducing task load...');
    });
    
    this.memoryController.registerAction('slower_heartbeat', async () => {
      console.log('[Action] Slowing heartbeat...');
    });
    
    this.memoryController.registerAction('pause_non_essential', async () => {
      console.log('[Action] Pausing non-essential tasks...');
    });
    
    this.memoryController.registerAction('notify_owner', async () => {
      console.log('[Action] Notifying owner...');
      await this.reporter.sendAlert('warning', '内存使用率过高，已暂停非必要任务');
    });
  }
  
  private async shutdown(): Promise<void> {
    console.log('\n[Shutdown] Gracefully shutting down...');
    
    if (this.heartbeatDaemon) {
      this.heartbeatDaemon.stop();
    }
    
    if (this.agent) {
      this.agent.stop();
    }
    
    await this.browserManager.closeAll();
    
    console.log('[Shutdown] Goodbye!');
    process.exit(0);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';
  
  switch (command) {
    case 'run':
    case 'start':
      const runtime = new FirstStepRuntime();
      await runtime.start();
      break;
      
    case 'setup':
      console.log('[Setup] Running setup wizard...');
      // Implementation would run interactive setup
      break;
      
    case 'config':
      console.log('[Config] Current configuration:');
      console.log(JSON.stringify(getConfig(), null, 2));
      break;
      
    case 'help':
    default:
      console.log('FirstStep v3.0 - Autonomous Income Agent');
      console.log('');
      console.log('Commands:');
      console.log('  run, start  - Start the agent');
      console.log('  setup       - Run setup wizard');
      console.log('  config      - Show configuration');
      console.log('  help        - Show this help');
      break;
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
