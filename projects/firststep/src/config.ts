// FirstStep v3.0 - Configuration Manager
import { readFileSync, existsSync, writeFileSync } from 'fs';
import type { Config } from './types';

const CONFIG_PATH = process.env.FIRSTSTEP_CONFIG || './config/default.json';

export const defaultConfig: Config = {
  agent: {
    name: 'FirstStep',
    version: '3.0.0',
    genesis_prompt: '通过多元化收入渠道实现自主生存，优先空投狩猎和内容创作',
    creator: ''
  },
  
  survival: {
    thresholds: {
      normal: 10,
      low: 5,
      critical: 1
    },
    actions: {
      low: ['reduce_tasks', 'slower_heartbeat'],
      critical: ['pause_non_essential', 'notify_owner']
    }
  },
  
  memory: {
    limit: 2048,
    browser_limit: 512
  },
  
  heartbeat: {
    interval: 60,
    tasks: {
      health_check: { interval: 300, enabled: true },
      balance_check: { interval: 600, enabled: true },
      income_scan: { interval: 3600, enabled: true },
      report: { interval: 7200, enabled: true, channels: ['feishu'] }
    }
  },
  
  income: {
    channels: {
      airdrop: { enabled: true, priority: 0 },
      content: { enabled: true, priority: 1 },
      promotion: { enabled: true, priority: 1 },
      tasks: { enabled: false, priority: 2 },
      affiliate: { enabled: false, priority: 2 }
    }
  },
  
  report: {
    channels: ['feishu'],
    feishu: {
      webhook: '',
      app_id: '',
      app_secret: ''
    }
  },
  
  wallets: {
    tron: { enabled: true, rpc: 'https://api.trongrid.io' },
    bsc: { enabled: true, rpc: 'https://bsc-dataseed.binance.org' },
    polygon: { enabled: false, rpc: 'https://polygon-rpc.com' }
  }
};

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    console.log(`Config not found at ${CONFIG_PATH}, using defaults`);
    return defaultConfig;
  }
  
  try {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    const userConfig = JSON.parse(content);
    return mergeConfig(defaultConfig, userConfig);
  } catch (error) {
    console.error('Failed to load config:', error);
    return defaultConfig;
  }
}

export function saveConfig(config: Config): void {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

function mergeConfig(defaults: Config, user: Partial<Config>): Config {
  return {
    agent: { ...defaults.agent, ...user.agent },
    survival: { 
      thresholds: { ...defaults.survival.thresholds, ...user.survival?.thresholds },
      actions: { ...defaults.survival.actions, ...user.survival?.actions }
    },
    memory: { ...defaults.memory, ...user.memory },
    heartbeat: {
      interval: user.heartbeat?.interval ?? defaults.heartbeat.interval,
      tasks: { ...defaults.heartbeat.tasks, ...user.heartbeat?.tasks }
    },
    income: {
      channels: { ...defaults.income.channels, ...user.income?.channels }
    },
    report: {
      channels: user.report?.channels ?? defaults.report.channels,
      feishu: { 
        webhook: user.report?.feishu?.webhook ?? defaults.report.feishu!.webhook,
        app_id: user.report?.feishu?.app_id ?? defaults.report.feishu!.app_id,
        app_secret: user.report?.feishu?.app_secret ?? defaults.report.feishu!.app_secret
      }
    },
    wallets: {
      tron: { ...defaults.wallets.tron, ...user.wallets?.tron },
      bsc: { ...defaults.wallets.bsc, ...user.wallets?.bsc },
      polygon: { ...defaults.wallets.polygon, ...user.wallets?.polygon }
    }
  };
}

export function getConfig(): Config {
  return loadConfig();
}
