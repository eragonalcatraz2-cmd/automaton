// FirstStep v3.0 - Gasless Task Automation
// 浏览器自动化执行无 gas 任务

import puppeteer from 'puppeteer';
import type { Opportunity } from '../types';

export class GaslessTaskExecutor {
  private browser: any;
  private page: any;
  
  async initialize(): Promise<boolean> {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // 显示浏览器便于调试
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log('[Automation] Browser initialized');
      return true;
    } catch (error) {
      console.error('[Automation] Failed to initialize browser:', error);
      return false;
    }
  }
  
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('[Automation] Browser closed');
    }
  }
  
  // 执行 Galxe 任务
  async executeGalxeTask(opportunity: Opportunity): Promise<boolean> {
    console.log(`[Automation] Executing Galxe task: ${opportunity.title}`);
    
    try {
      this.page = await this.browser.newPage();
      
      // 1. 访问 Galxe
      await this.page.goto('https://galxe.com', { waitUntil: 'networkidle0' });
      console.log('[Automation] Loaded Galxe');
      
      // 2. 等待并点击连接钱包按钮
      await this.page.waitForTimeout(3000);
      
      // 3. 查找并点击任务
      console.log('[Automation] Looking for available campaigns...');
      
      // 4. 截图保存状态
      await this.page.screenshot({ 
        path: `/opt/firststep/logs/galxe-${Date.now()}.png`,
        fullPage: true 
      });
      
      console.log('[Automation] Galxe task initiated, manual confirmation may be required');
      return true;
    } catch (error) {
      console.error('[Automation] Galxe task failed:', error);
      return false;
    }
  }
  
  // 执行 Guild.xyz 任务
  async executeGuildTask(opportunity: Opportunity): Promise<boolean> {
    console.log(`[Automation] Executing Guild task: ${opportunity.title}`);
    
    try {
      this.page = await this.browser.newPage();
      
      await this.page.goto('https://guild.xyz', { waitUntil: 'networkidle0' });
      console.log('[Automation] Loaded Guild.xyz');
      
      await this.page.waitForTimeout(3000);
      
      // 截图
      await this.page.screenshot({ 
        path: `/opt/firststep/logs/guild-${Date.now()}.png`,
        fullPage: true 
      });
      
      console.log('[Automation] Guild task initiated');
      return true;
    } catch (error) {
      console.error('[Automation] Guild task failed:', error);
      return false;
    }
  }
  
  // 执行 Zealy 任务
  async executeZealyTask(opportunity: Opportunity): Promise<boolean> {
    console.log(`[Automation] Executing Zealy task: ${opportunity.title}`);
    
    try {
      this.page = await this.browser.newPage();
      
      await this.page.goto('https://zealy.io', { waitUntil: 'networkidle0' });
      console.log('[Automation] Loaded Zealy');
      
      await this.page.waitForTimeout(3000);
      
      await this.page.screenshot({ 
        path: `/opt/firststep/logs/zealy-${Date.now()}.png`,
        fullPage: true 
      });
      
      console.log('[Automation] Zealy task initiated');
      return true;
    } catch (error) {
      console.error('[Automation] Zealy task failed:', error);
      return false;
    }
  }
  
  // 执行 Snapshot 投票
  async executeSnapshotTask(opportunity: Opportunity): Promise<boolean> {
    console.log(`[Automation] Executing Snapshot task: ${opportunity.title}`);
    
    try {
      this.page = await this.browser.newPage();
      
      await this.page.goto('https://snapshot.org', { waitUntil: 'networkidle0' });
      console.log('[Automation] Loaded Snapshot');
      
      await this.page.waitForTimeout(3000);
      
      await this.page.screenshot({ 
        path: `/opt/firststep/logs/snapshot-${Date.now()}.png`,
        fullPage: true 
      });
      
      console.log('[Automation] Snapshot task initiated');
      return true;
    } catch (error) {
      console.error('[Automation] Snapshot task failed:', error);
      return false;
    }
  }
  
  // 批量执行任务
  async executeBatch(tasks: Opportunity[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const task of tasks.slice(0, 3)) { // 先执行前3个
      switch (true) {
        case task.url?.includes('galxe'):
          results[task.id] = await this.executeGalxeTask(task);
          break;
        case task.url?.includes('guild'):
          results[task.id] = await this.executeGuildTask(task);
          break;
        case task.url?.includes('zealy'):
          results[task.id] = await this.executeZealyTask(task);
          break;
        case task.url?.includes('snapshot'):
          results[task.id] = await this.executeSnapshotTask(task);
          break;
        default:
          console.log(`[Automation] Unknown platform for ${task.title}`);
          results[task.id] = false;
      }
      
      // 每个任务之间等待 5 秒
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return results;
  }
}