#!/usr/bin/env node
"use strict";
/**
 * Automaton - 自主AI代理系统
 * 入口文件
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Agent_1 = require("./core/Agent");
async function main() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     🤖 AUTOMATON v1.0 - Self-Sustaining AI ║');
    console.log('║        "Create value or cease to exist"    ║');
    console.log('╚══════════════════════════════════════════╝\n');
    const agent = new Agent_1.ReActAgent();
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
        console.log('[MAIN] Agent is running. Press Ctrl+C to stop.\n');
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