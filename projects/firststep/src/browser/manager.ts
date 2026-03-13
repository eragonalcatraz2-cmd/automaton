// FirstStep v3.0 - Browser Manager with Memory Control
import puppeteer, { Browser, Page } from 'puppeteer';
import type { Config } from '../types';

export interface BrowserOptions {
  headless?: boolean;
  proxy?: string;
  userAgent?: string;
}

export class BrowserManager {
  private config: Config;
  private browsers: Map<string, Browser> = new Map();
  private pages: Map<string, Page> = new Map();
  
  constructor(config: Config) {
    this.config = config;
  }
  
  async launch(instanceId: string = 'default', options: BrowserOptions = {}): Promise<Browser> {
    console.log(`[Browser] Launching instance: ${instanceId}`);
    
    const browserLimit = this.config.memory.browser_limit;
    
    const launchOptions = {
      headless: options.headless ?? true,
      args: [
        `--max-old-space-size=${browserLimit}`,
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timers-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    };
    
    if (options.proxy) {
      launchOptions.args.push(`--proxy-server=${options.proxy}`);
    }
    
    try {
      const browser = await puppeteer.launch(launchOptions);
      this.browsers.set(instanceId, browser);
      
      // Monitor memory usage
      this.monitorMemory(instanceId, browser);
      
      console.log(`[Browser] Instance ${instanceId} launched successfully`);
      return browser;
      
    } catch (error) {
      console.error(`[Browser] Failed to launch instance ${instanceId}:`, error);
      throw error;
    }
  }
  
  async newPage(instanceId: string = 'default', pageId?: string): Promise<Page> {
    const browser = this.browsers.get(instanceId);
    if (!browser) {
      throw new Error(`Browser instance ${instanceId} not found`);
    }
    
    const page = await browser.newPage();
    const _pid = pageId || `page_${Date.now()}`;
    this.pages.set(_pid, page);
    
    // Set user agent if needed
    // await page.setUserAgent('...');
    
    return page;
  }
  
  async closePage(pageId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (page) {
      await page.close();
      this.pages.delete(pageId);
      console.log(`[Browser] Page ${pageId} closed`);
    }
  }
  
  async close(instanceId: string): Promise<void> {
    const browser = this.browsers.get(instanceId);
    if (browser) {
      await browser.close();
      this.browsers.delete(instanceId);
      
      // Clean up associated pages
      for (const [pid, page] of this.pages.entries()) {
        try {
          await page.close();
        } catch {
          // Ignore errors for already closed pages
        }
      }
      this.pages.clear();
      
      console.log(`[Browser] Instance ${instanceId} closed`);
    }
  }
  
  async closeAll(): Promise<void> {
    console.log('[Browser] Closing all instances...');
    
    for (const [id, browser] of this.browsers) {
      try {
        await browser.close();
        console.log(`[Browser] Instance ${id} closed`);
      } catch (error) {
        console.error(`[Browser] Error closing instance ${id}:`, error);
      }
    }
    
    this.browsers.clear();
    this.pages.clear();
  }
  
  private monitorMemory(instanceId: string, browser: Browser): void {
    // Monitor memory usage periodically
    const interval = setInterval(async () => {
      try {
        if (!this.browsers.has(instanceId)) {
          clearInterval(interval);
          return;
        }
        
        // Get browser memory metrics
        const pages = await browser.pages();
        console.log(`[Browser] Instance ${instanceId}: ${pages.length} pages open`);
        
        // Check if we need to clean up
        if (pages.length > 5) {
          console.warn(`[Browser] Instance ${instanceId} has too many pages, cleaning up...`);
          // Close oldest pages
          for (let i = 0; i < pages.length - 3; i++) {
            try {
              await pages[i].close();
            } catch {
              // Ignore errors
            }
          }
        }
        
      } catch (error) {
        console.error(`[Browser] Memory monitoring error for ${instanceId}:`, error);
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds
  }
  
  getBrowser(instanceId: string): Browser | undefined {
    return this.browsers.get(instanceId);
  }
  
  getPage(pageId: string): Page | undefined {
    return this.pages.get(pageId);
  }
  
  getActiveCount(): number {
    return this.browsers.size;
  }
}

// Singleton instance
let browserManager: BrowserManager | null = null;

export function getBrowserManager(config: Config): BrowserManager {
  if (!browserManager) {
    browserManager = new BrowserManager(config);
  }
  return browserManager;
}
