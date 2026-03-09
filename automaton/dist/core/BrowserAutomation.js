"use strict";
/**
 * BrowserAutomation - 浏览器自动化模块
 * 用于处理需要浏览器交互的任务（水龙头、社交任务、KYC等）
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAutomation = void 0;
class BrowserAutomation {
    constructor() {
        this.isAvailable = false;
        // 检查浏览器自动化是否可用
        this.checkAvailability();
    }
    async checkAvailability() {
        // 检查是否安装了 puppeteer 或 playwright
        try {
            // 尝试动态导入
            // const puppeteer = await import('puppeteer');
            // this.isAvailable = true;
            console.log('[Browser] Automation module initialized');
        }
        catch (error) {
            console.log('[Browser] Puppeteer not available, browser automation disabled');
            this.isAvailable = false;
        }
    }
    /**
     * 执行浏览器任务
     */
    async executeTask(task) {
        if (!this.isAvailable) {
            return {
                success: false,
                output: 'Browser automation not available',
                metadata: { error: 'Puppeteer not installed' }
            };
        }
        console.log(`[Browser] Executing task: ${task.type} at ${task.url}`);
        try {
            // 动态导入 puppeteer（避免启动时加载）
            const puppeteer = await Promise.resolve().then(() => __importStar(require('puppeteer')));
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // 设置视口
            await page.setViewport({ width: 1920, height: 1080 });
            // 执行步骤
            for (const step of task.steps) {
                await this.executeStep(page, step, task.walletAddress);
            }
            await browser.close();
            return {
                success: true,
                output: `Browser task completed: ${task.type}`,
                metadata: { taskId: task.id, type: task.type }
            };
        }
        catch (error) {
            return {
                success: false,
                output: `Browser task failed: ${error.message}`,
                metadata: { error: error.message }
            };
        }
    }
    async executeStep(page, step, walletAddress) {
        switch (step.action) {
            case 'navigate':
                await page.goto(step.value || '', { waitUntil: 'networkidle2' });
                break;
            case 'click':
                if (step.selector) {
                    await page.waitForSelector(step.selector);
                    await page.click(step.selector);
                }
                break;
            case 'type':
                if (step.selector && step.value) {
                    await page.waitForSelector(step.selector);
                    // 替换变量
                    const value = step.value.replace('{{wallet}}', walletAddress || '');
                    await page.type(step.selector, value);
                }
                break;
            case 'wait':
                await new Promise(resolve => setTimeout(resolve, step.delay || 1000));
                break;
            case 'screenshot':
                await page.screenshot({ path: `screenshot-${Date.now()}.png` });
                break;
            case 'solveCaptcha':
                // 集成验证码解决服务（如 2captcha、Anti-Captcha）
                console.log('[Browser] Captcha solving not implemented yet');
                break;
        }
    }
    /**
     * 请求水龙头（浏览器自动化版本）
     */
    async requestFaucet(faucetUrl, walletAddress) {
        const task = {
            id: `faucet-${Date.now()}`,
            type: 'faucet',
            url: faucetUrl,
            walletAddress,
            steps: [
                { action: 'navigate', value: faucetUrl },
                { action: 'wait', delay: 2000 },
                { action: 'type', selector: 'input[name="address"], input[placeholder*="address"], #address', value: '{{wallet}}' },
                { action: 'wait', delay: 1000 },
                { action: 'click', selector: 'button[type="submit"], button:has-text("Request"), button:has-text("Send")' },
                { action: 'wait', delay: 5000 },
                { action: 'screenshot' }
            ]
        };
        return this.executeTask(task);
    }
    /**
     * 执行社交任务（Twitter/X）
     */
    async executeSocialTask(platform, action, target) {
        const urls = {
            twitter: `https://twitter.com/${target}`,
            discord: target, // Discord 邀请链接
            telegram: target // Telegram 链接
        };
        const task = {
            id: `social-${Date.now()}`,
            type: 'social',
            url: urls[platform],
            steps: [
                { action: 'navigate', value: urls[platform] },
                { action: 'wait', delay: 3000 }
                // 根据具体平台和动作添加更多步骤
            ]
        };
        return this.executeTask(task);
    }
}
exports.BrowserAutomation = BrowserAutomation;
//# sourceMappingURL=BrowserAutomation.js.map