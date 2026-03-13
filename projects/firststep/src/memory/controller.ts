// FirstStep v3.0 - Memory Controller
import { exec } from 'child_process';
import { promisify } from 'util';
import type { Config, SurvivalTier } from '../types';

const execAsync = promisify(exec);

export class MemoryController {
  private config: Config;
  private currentTier: SurvivalTier = 'normal';
  private callbacks: Map<string, Function> = new Map();
  
  constructor(config: Config) {
    this.config = config;
  }
  
  async getUsage(): Promise<{ used: number; total: number }> {
    try {
      // Get memory info from system
      const { stdout } = await execAsync('free -m | grep Mem');
      const parts = stdout.trim().split(/\s+/);
      const total = parseInt(parts[1], 10);
      const used = parseInt(parts[2], 10);
      
      return { used, total };
    } catch {
      // Fallback to Node.js memory usage
      const usage = process.memoryUsage();
      return {
        used: Math.round(usage.heapUsed / 1024 / 1024),
        total: this.config.memory.limit
      };
    }
  }
  
  async getTier(): Promise<SurvivalTier> {
    const { used } = await this.getUsage();
    const limit = this.config.memory.limit;
    const percent = (used / limit) * 100;
    
    if (percent >= 95) return 'critical';
    if (percent >= 85) return 'low';
    return 'normal';
  }
  
  async checkAndDowngrade(): Promise<SurvivalTier> {
    const tier = await this.getTier();
    
    if (tier !== this.currentTier) {
      console.log(`[Memory] Tier changed: ${this.currentTier} -> ${tier}`);
      this.currentTier = tier;
      await this.executeDowngradeActions(tier);
    }
    
    return tier;
  }
  
  private async executeDowngradeActions(tier: SurvivalTier): Promise<void> {
    const actions = this.config.survival.actions;
    
    switch (tier) {
      case 'low':
        console.log('[Memory] Executing low memory actions...');
        for (const action of actions.low) {
          await this.executeAction(action);
        }
        break;
        
      case 'critical':
        console.log('[Memory] Executing critical memory actions...');
        for (const action of actions.critical) {
          await this.executeAction(action);
        }
        break;
    }
  }
  
  private async executeAction(action: string): Promise<void> {
    console.log(`[Memory] Executing action: ${action}`);
    
    const callback = this.callbacks.get(action);
    if (callback) {
      try {
        await callback();
      } catch (error) {
        console.error(`[Memory] Action ${action} failed:`, error);
      }
    }
  }
  
  registerAction(action: string, callback: Function): void {
    this.callbacks.set(action, callback);
  }
  
  async forceGC(): Promise<void> {
    console.log('[Memory] Forcing garbage collection...');
    
    if (global.gc) {
      global.gc();
    }
    
    // Also try to clear V8 optimizations
    const v8 = require('v8');
    v8.setFlagsFromString('--expose_gc');
  }
  
  async getProcessMemory(): Promise<NodeJS.MemoryUsage> {
    return process.memoryUsage();
  }
  
  startMonitoring(intervalMs: number = 30000): void {
    console.log(`[Memory] Starting monitoring (interval: ${intervalMs}ms)`);
    
    setInterval(async () => {
      try {
        const usage = await this.getUsage();
        const tier = await this.checkAndDowngrade();
        
        console.log(`[Memory] Usage: ${usage.used}MB/${usage.total}MB (${tier})`);
        
      } catch (error) {
        console.error('[Memory] Monitoring error:', error);
      }
    }, intervalMs);
  }
  
  getCurrentTier(): SurvivalTier {
    return this.currentTier;
  }
}

// Singleton instance
let memoryController: MemoryController | null = null;

export function getMemoryController(config: Config): MemoryController {
  if (!memoryController) {
    memoryController = new MemoryController(config);
  }
  return memoryController;
}
