#!/usr/bin/env node
"use strict";
/**
 * Automaton v2.0 - 全自动自主AI代理系统
 * "Create value or cease to exist"
 *
 * 特性：
 * - 真实区块链交互（ethers.js）
 * - 浏览器自动化（puppeteer）
 * - 全自动空投狩猎
 * - 零人工干预
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AgentV2_1 = require("./core/AgentV2");
async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     🤖 AUTOMATON v2.0 - Fully Autonomous AI Agent       ║');
    console.log('║        "Create value or cease to exist"                  ║');
    console.log('║                                                          ║');
    console.log('║  Features:                                               ║');
    console.log('║  • Real blockchain interactions (ethers.js)              ║');
    console.log('║  • Browser automation (Puppeteer)                        ║');
    console.log('║  • Automated airdrop hunting                             ║');
    console.log('║  • Zero human intervention                               ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    // Check required environment variables
    const requiredEnv = ['PRIVATE_KEY'];
    const missing = requiredEnv.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error('[ERROR] Missing required environment variables:');
        console.error(`  ${missing.join(', ')}`);
        console.error('\nPlease set them before running:');
        console.error('  export PRIVATE_KEY=your_wallet_private_key');
        process.exit(1);
    }
    const agent = new AgentV2_1.ReActAgentV2();
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n[MAIN] Received SIGINT, shutting down gracefully...');
        await agent.stop();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('\n[MAIN] Received SIGTERM, shutting down gracefully...');
        await agent.stop();
        process.exit(0);
    });
    try {
        // Initialize the agent
        await agent.initialize();
        // Start the agent
        await agent.start();
        console.log('[MAIN] Agent is running in FULLY AUTONOMOUS mode.');
        console.log('[MAIN] Press Ctrl+C to stop.\n');
        // Keep the process alive
        while (agent.getStatus().running) {
            await sleep(1000);
        }
    }
    catch (error) {
        console.error('[MAIN] Fatal error:', error);
        await agent.stop();
        process.exit(1);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Run the main function
main().catch(console.error);
//# sourceMappingURL=index.js.map