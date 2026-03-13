// FirstStep v3.0 - Feishu (Lark) Reporting Service
import { Client } from '@larksuiteoapi/node-sdk';
import type { Config, Report } from '../types';

export class FeishuReporter {
  private config: Config;
  private client: Client | null = null;
  private webhookUrl: string | null = null;
  
  constructor(config: Config) {
    this.config = config;
    this.initialize();
  }
  
  private initialize(): void {
    const { app_id, app_secret, webhook } = this.config.report.feishu || {};
    
    if (app_id && app_secret) {
      this.client = new Client({
        appId: app_id,
        appSecret: app_secret,
        appType: 'customApp' as any,
      });
    }
    
    if (webhook) {
      this.webhookUrl = webhook;
    }
  }
  
  async sendReport(report: Report): Promise<boolean> {
    try {
      const message = this.formatReportMessage(report);
      
      if (this.webhookUrl) {
        await this.sendWebhook(message);
      } else if (this.client) {
        await this.sendViaAPI(message);
      } else {
        console.log('[Feishu] No configuration, logging to console:');
        console.log(message);
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('[Feishu] Failed to send report:', error);
      return false;
    }
  }
  
  async sendAlert(level: 'info' | 'warning' | 'critical', message: string): Promise<boolean> {
    try {
      const emoji = level === 'critical' ? '🔴' : level === 'warning' ? '🟡' : '🔵';
      const formatted = `${emoji} **FirstStep Alert**\n\n${message}\n\n*${new Date().toLocaleString('zh-CN')}*`;
      
      if (this.webhookUrl) {
        await this.sendWebhook(formatted);
      } else {
        console.log('[Feishu] Alert:', message);
      }
      
      return true;
    } catch (error) {
      console.error('[Feishu] Failed to send alert:', error);
      return false;
    }
  }
  
  private formatReportMessage(report: Report): string {
    const sections: string[] = [];
    
    // Header
    sections.push('📊 **FirstStep 状态报告**');
    sections.push(`*${report.timestamp.toLocaleString('zh-CN')}*`);
    sections.push('');
    
    // System Status
    sections.push('🖥️ **系统状态**');
    sections.push(`• 运行状态: ${this.getStatusEmoji(report.system.status)} ${report.system.status}`);
    sections.push(`• 运行时间: ${this.formatUptime(report.system.uptime)}`);
    sections.push(`• 内存使用: ${report.system.memory.used.toFixed(0)}MB / ${report.system.memory.total}MB`);
    sections.push('');
    
    // Finance Status
    sections.push('💰 **财务状态**');
    const totalBalance = Object.entries(report.finance.balances)
      .reduce((sum: number, [_, balance]: [string, number]) => sum + balance, 0);
    sections.push(`• 总余额: $${totalBalance.toFixed(2)}`);
    
    for (const [chain, balance] of Object.entries(report.finance.balances)) {
      sections.push(`• ${chain.toUpperCase()}: $${(balance as number).toFixed(2)}`);
    }
    
    sections.push(`• 24h 收入: $${report.finance.income24h.toFixed(2)}`);
    sections.push(`• 24h 支出: $${report.finance.expenses24h.toFixed(2)}`);
    sections.push('');
    
    // Tasks
    sections.push('📋 **任务状态**');
    sections.push(`• 已完成: ${report.tasks.completed}`);
    sections.push(`• 失败: ${report.tasks.failed}`);
    sections.push(`• 待处理: ${report.tasks.pending}`);
    sections.push('');
    
    // Income
    if (report.income.length > 0) {
      sections.push('💵 **最近收入**');
      for (const item of report.income.slice(0, 5)) {
        sections.push(`• ${item.channel}: ${item.amount} ${item.currency} - ${item.description}`);
      }
      sections.push('');
    }
    
    // Alerts
    if (report.alerts.length > 0) {
      sections.push('⚠️ **告警**');
      for (const alert of report.alerts) {
        const emoji = alert.level === 'critical' ? '🔴' : alert.level === 'warning' ? '🟡' : '🔵';
        sections.push(`${emoji} ${alert.message}`);
      }
    }
    
    return sections.join('\n');
  }
  
  private async sendWebhook(message: string): Promise<void> {
    if (!this.webhookUrl) return;
    
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: {
          text: message
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }
  
  private async sendViaAPI(message: string): Promise<void> {
    // TODO: Implement Feishu API sending
    // This would use the SDK to send to specific chat/group
    console.log('[Feishu] API sending not implemented, message:', message);
  }
  
  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      normal: '🟢',
      low: '🟡',
      critical: '🔴',
      paused: '⏸️'
    };
    return emojis[status] || '⚪';
  }
  
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}天 ${hours}小时`;
    if (hours > 0) return `${hours}小时 ${minutes}分钟`;
    return `${minutes}分钟`;
  }
}

// Singleton instance
let feishuReporter: FeishuReporter | null = null;

export function getFeishuReporter(config: Config): FeishuReporter {
  if (!feishuReporter) {
    feishuReporter = new FeishuReporter(config);
  }
  return feishuReporter;
}