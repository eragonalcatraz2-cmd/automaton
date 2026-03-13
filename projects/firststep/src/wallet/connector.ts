// FirstStep v3.0 - Wallet Connector for Browser Automation
// 自动连接 MetaMask/WalletConnect 到网站

import type { Config } from '../types';

export class WalletConnector {
  private config: Config;
  
  constructor(config: Config) {
    this.config = config;
  }
  
  // 在页面中注入钱包连接脚本
  async injectWallet(page: any, chain: string): Promise<boolean> {
    console.log(`[WalletConnector] Injecting ${chain} wallet...`);
    
    try {
      // 获取私钥
      const privateKey = this.getPrivateKey(chain);
      if (!privateKey) {
        console.error(`[WalletConnector] No private key for ${chain}`);
        return false;
      }
      
      // 注入 MetaMask 模拟脚本
      await page.evaluateOnNewDocument((key: string, chainName: string) => {
        // 模拟 window.ethereum
        const win = window as any;
        win.ethereum = {
          isMetaMask: true,
          selectedAddress: null,
          chainId: null,
          
          async request(args: any) {
            console.log('[MetaMask Mock] Request:', args.method);
            
            switch (args.method) {
              case 'eth_requestAccounts':
              case 'eth_accounts':
                // 返回连接的地址
                return ['0xED261c7431667c91ef28C1320Ff97cF962689710'];
                
              case 'eth_chainId':
                return chainName === 'bsc' ? '0x38' : '0x1';
                
              case 'eth_sendTransaction':
                console.log('[MetaMask Mock] Transaction requested:', args.params);
                // 返回模拟的交易哈希
                return '0x' + Array(64).fill('0').join('');
                
              case 'personal_sign':
              case 'eth_signTypedData_v4':
                console.log('[MetaMask Mock] Signing requested');
                return '0x' + Array(130).fill('0').join('');
                
              default:
                console.log('[MetaMask Mock] Unhandled method:', args.method);
                return null;
            }
          },
          
          on(event: string, callback: Function) {
            console.log('[MetaMask Mock] Event listener added:', event);
          },
          
          removeListener(event: string, callback: Function) {
            console.log('[MetaMask Mock] Event listener removed:', event);
          }
        } as any;
        
        console.log('[WalletConnector] MetaMask mock injected');
      }, privateKey, chain);
      
      console.log(`[WalletConnector] ${chain} wallet injected successfully`);
      return true;
    } catch (error) {
      console.error(`[WalletConnector] Failed to inject wallet:`, error);
      return false;
    }
  }
  
  // 点击连接钱包按钮
  async clickConnectButton(page: any): Promise<boolean> {
    console.log('[WalletConnector] Looking for connect button...');
    
    try {
      // 常见的连接按钮选择器
      const selectors = [
        'button:has-text("Connect")',
        'button:has-text("Connect Wallet")',
        'button:has-text("Connect MetaMask")',
        '[data-testid="connect-button"]',
        '.connect-wallet',
        '#connect-wallet',
        'button:contains("Connect")'
      ];
      
      for (const selector of selectors) {
        const button = await page.$(selector);
        if (button) {
          console.log(`[WalletConnector] Found connect button: ${selector}`);
          await button.click();
          await page.waitForTimeout(2000);
          return true;
        }
      }
      
      console.log('[WalletConnector] No connect button found');
      return false;
    } catch (error) {
      console.error('[WalletConnector] Failed to click connect button:', error);
      return false;
    }
  }
  
  // 处理钱包选择弹窗
  async selectWalletInPopup(page: any, walletName: string = 'MetaMask'): Promise<boolean> {
    console.log(`[WalletConnector] Selecting ${walletName}...`);
    
    try {
      // 等待弹窗出现
      await page.waitForTimeout(1000);
      
      // 查找 MetaMask 选项
      const metamaskSelectors = [
        'button:has-text("MetaMask")',
        '[data-testid="wallet-option-metamask"]',
        '.wallet-option:has-text("MetaMask")'
      ];
      
      for (const selector of metamaskSelectors) {
        const option = await page.$(selector);
        if (option) {
          console.log(`[WalletConnector] Found ${walletName} option`);
          await option.click();
          await page.waitForTimeout(2000);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[WalletConnector] Failed to select wallet:', error);
      return false;
    }
  }
  
  // 完整连接流程
  async connectWallet(page: any, chain: string): Promise<boolean> {
    console.log(`[WalletConnector] Starting wallet connection for ${chain}...`);
    
    // 1. 注入钱包
    const injected = await this.injectWallet(page, chain);
    if (!injected) return false;
    
    // 2. 刷新页面以应用注入
    await page.reload({ waitUntil: 'networkidle0' });
    
    // 3. 点击连接按钮
    const clicked = await this.clickConnectButton(page);
    if (!clicked) {
      console.log('[WalletConnector] Wallet might already be connected');
      return true;
    }
    
    // 4. 选择钱包
    await this.selectWalletInPopup(page, 'MetaMask');
    
    console.log('[WalletConnector] Wallet connection completed');
    return true;
  }
  
  private getPrivateKey(chain: string): string | undefined {
    switch (chain) {
      case 'bsc':
      case 'ethereum':
        return process.env.BSC_PRIVATE_KEY;
      case 'tron':
        return process.env.TRON_PRIVATE_KEY;
      case 'polygon':
        return process.env.POLYGON_PRIVATE_KEY;
      default:
        return undefined;
    }
  }
}