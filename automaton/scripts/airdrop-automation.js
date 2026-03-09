#!/usr/bin/env node
/**
 * Airdrop Automation Script
 * 自动化完成空投任务
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const WALLET_ADDRESS = '0xED261c7431667c91ef28C1320Ff97cF962689710';
const CHROME_PATH = '/usr/bin/google-chrome';
const USER_DATA_DIR = '/tmp/chrome-airdrop-profile';

// 确保用户数据目录存在
if (!fs.existsSync(USER_DATA_DIR)) {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
}

/**
 * 执行 Chrome 命令
 */
function runChrome(url, options = {}) {
  const {
    headless = true,
    waitTime = 5000,
    screenshot = null
  } = options;

  const args = [
    headless ? '--headless' : '',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1920,1080',
    '--disable-blink-features=AutomationControlled',
    screenshot ? `--screenshot=${screenshot}` : '',
    url
  ].filter(Boolean);

  const cmd = `export DISPLAY=:99 && Xvfb :99 -screen 0 1920x1080x24 > /dev/null 2>&1 & sleep 2 && ${CHROME_PATH} ${args.join(' ')}`;

  return new Promise((resolve, reject) => {
    console.log(`[Automation] Opening: ${url}`);
    
    const child = exec(cmd, { timeout: waitTime + 10000 }, (error, stdout, stderr) => {
      if (error && error.killed) {
        // Timeout is expected for long-running pages
        resolve({ success: true, output: stdout });
      } else if (error) {
        reject(error);
      } else {
        resolve({ success: true, output: stdout });
      }
    });

    // Kill after waitTime
    setTimeout(() => {
      child.kill();
    }, waitTime);
  });
}

/**
 * Linea 空投任务
 */
async function lineaAirdrop() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║      Linea Airdrop Automation          ║');
  console.log('╚════════════════════════════════════════╝\n');

  const tasks = [
    {
      name: 'Visit Linea Hub',
      url: 'https://linea.build',
      waitTime: 5000
    },
    {
      name: 'Check Rewards Page',
      url: 'https://linea.build/quests',
      waitTime: 5000
    },
    {
      name: 'Spin to Win Page',
      url: 'https://linea.build/airdrop',
      waitTime: 5000
    }
  ];

  for (const task of tasks) {
    try {
      console.log(`[Task] ${task.name}...`);
      await runChrome(task.url, { 
        waitTime: task.waitTime,
        screenshot: `/tmp/linea-${Date.now()}.png`
      });
      console.log(`[Task] ✓ ${task.name} completed`);
    } catch (error) {
      console.error(`[Task] ✗ ${task.name} failed:`, error.message);
    }
  }

  console.log('\n[Linea] Automation complete');
  console.log(`[Linea] Wallet: ${WALLET_ADDRESS}`);
  console.log('[Linea] Note: Manual interaction required for actual tasks\n');
}

/**
 * Base Onchain Summer 任务
 */
async function baseAirdrop() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║    Base Onchain Summer Automation      ║');
  console.log('╚════════════════════════════════════════╝\n');

  const tasks = [
    {
      name: 'Visit Base',
      url: 'https://base.org',
      waitTime: 5000
    },
    {
      name: 'Onchain Summer',
      url: 'https://base.org/onchainsummer',
      waitTime: 5000
    }
  ];

  for (const task of tasks) {
    try {
      console.log(`[Task] ${task.name}...`);
      await runChrome(task.url, { waitTime: task.waitTime });
      console.log(`[Task] ✓ ${task.name} completed`);
    } catch (error) {
      console.error(`[Task] ✗ ${task.name} failed:`, error.message);
    }
  }

  console.log('\n[Base] Automation complete\n');
}

/**
 * 生成每日报告
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    wallet: WALLET_ADDRESS,
    completedTasks: [],
    pendingTasks: [
      'Linea: Connect wallet and spin',
      'Base: Complete social tasks',
      'Scroll: Deploy test contract'
    ],
    nextSteps: [
      'Visit project websites manually',
      'Connect MetaMask wallet',
      'Complete interactive tasks'
    ]
  };

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║         Daily Airdrop Report           ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nWallet: ${report.wallet}`);
  console.log(`Time: ${report.timestamp}`);
  console.log('\nPending Tasks:');
  report.pendingTasks.forEach(t => console.log(`  • ${t}`));
  console.log('\nNext Steps:');
  report.nextSteps.forEach(s => console.log(`  → ${s}`));
  console.log('\n══════════════════════════════════════════\n');

  return report;
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 Automaton Airdrop Automation');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  switch (command) {
    case 'linea':
      await lineaAirdrop();
      break;
    case 'base':
      await baseAirdrop();
      break;
    case 'report':
      generateReport();
      break;
    case 'all':
    default:
      await lineaAirdrop();
      await baseAirdrop();
      generateReport();
      break;
  }
}

// 运行
main().catch(console.error);
