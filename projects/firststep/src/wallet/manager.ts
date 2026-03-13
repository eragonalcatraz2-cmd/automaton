// FirstStep v3.0 - Multi-Chain Wallet Manager
import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import type { Config } from '../types';

export interface WalletConfig {
  chain: string;
  privateKey: string;
  rpcUrl: string;
}

export class WalletManager {
  private config: Config;
  private tronWeb: TronWeb | null = null;
  private evmProviders: Map<string, ethers.JsonRpcProvider> = new Map();
  private evmWallets: Map<string, ethers.Wallet> = new Map();
  
  constructor(config: Config) {
    this.config = config;
    this.initializeWallets();
  }
  
  private initializeWallets(): void {
    // Load private keys from environment
    const tronKey = process.env.TRON_PRIVATE_KEY;
    const bscKey = process.env.BSC_PRIVATE_KEY;
    const polygonKey = process.env.POLYGON_PRIVATE_KEY;
    
    // Initialize Tron
    if (this.config.wallets.tron.enabled && tronKey) {
      try {
        this.tronWeb = new TronWeb({
          fullHost: this.config.wallets.tron.rpc,
          privateKey: tronKey
        });
        console.log('[Wallet] Tron wallet initialized');
      } catch (error) {
        console.error('[Wallet] Failed to initialize Tron:', error);
      }
    }
    
    // Initialize BSC
    if (this.config.wallets.bsc.enabled && bscKey) {
      try {
        const provider = new ethers.JsonRpcProvider(this.config.wallets.bsc.rpc);
        const wallet = new ethers.Wallet(bscKey, provider);
        this.evmProviders.set('bsc', provider);
        this.evmWallets.set('bsc', wallet);
        console.log('[Wallet] BSC wallet initialized');
      } catch (error) {
        console.error('[Wallet] Failed to initialize BSC:', error);
      }
    }
    
    // Initialize Polygon
    if (this.config.wallets.polygon.enabled && polygonKey) {
      try {
        const provider = new ethers.JsonRpcProvider(this.config.wallets.polygon.rpc);
        const wallet = new ethers.Wallet(polygonKey, provider);
        this.evmProviders.set('polygon', provider);
        this.evmWallets.set('polygon', wallet);
        console.log('[Wallet] Polygon wallet initialized');
      } catch (error) {
        console.error('[Wallet] Failed to initialize Polygon:', error);
      }
    }
  }
  
  async getAllBalances(): Promise<Record<string, number>> {
    const balances: Record<string, number> = {};
    
    // Get Tron balance
    if (this.tronWeb) {
      try {
        const address = this.tronWeb.defaultAddress.base58;
        const balance = await this.tronWeb.trx.getBalance(address);
        balances.tron = balance / 1e6; // Convert from SUN to TRX
      } catch (error) {
        console.error('[Wallet] Failed to get Tron balance:', error);
        balances.tron = 0;
      }
    }
    
    // Get BSC balance
    if (this.evmWallets.has('bsc')) {
      try {
        const wallet = this.evmWallets.get('bsc')!;
        const balance = await wallet.provider!.getBalance(wallet.address);
        balances.bsc = parseFloat(ethers.formatEther(balance));
      } catch (error) {
        console.error('[Wallet] Failed to get BSC balance:', error);
        balances.bsc = 0;
      }
    }
    
    // Get Polygon balance
    if (this.evmWallets.has('polygon')) {
      try {
        const wallet = this.evmWallets.get('polygon')!;
        const balance = await wallet.provider!.getBalance(wallet.address);
        balances.polygon = parseFloat(ethers.formatEther(balance));
      } catch (error) {
        console.error('[Wallet] Failed to get Polygon balance:', error);
        balances.polygon = 0;
      }
    }
    
    return balances;
  }
  
  async getUSDTBalance(chain: string): Promise<number> {
    const usdtContracts: Record<string, string> = {
      tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT on Tron
      bsc: '0x55d398326f99059fF775485246999027B3197955', // USDT on BSC
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' // USDT on Polygon
    };
    
    try {
      if (chain === 'tron' && this.tronWeb) {
        const contract = await this.tronWeb.contract().at(usdtContracts.tron);
        const address = this.tronWeb.defaultAddress.base58;
        const balance = await contract.balanceOf(address).call();
        return parseInt(String(balance)) / 1e6;
      }
      
      if (chain === 'bsc' && this.evmWallets.has('bsc')) {
        const provider = this.evmProviders.get('bsc')!;
        const wallet = this.evmWallets.get('bsc')!;
        const abi = ['function balanceOf(address) view returns (uint256)'];
        const contract = new ethers.Contract(usdtContracts.bsc, abi, provider);
        const balance = await contract.balanceOf(wallet.address);
        return parseFloat(ethers.formatUnits(balance, 18));
      }
      
      if (chain === 'polygon' && this.evmWallets.has('polygon')) {
        const provider = this.evmProviders.get('polygon')!;
        const wallet = this.evmWallets.get('polygon')!;
        const abi = ['function balanceOf(address) view returns (uint256)'];
        const contract = new ethers.Contract(usdtContracts.polygon, abi, provider);
        const balance = await contract.balanceOf(wallet.address);
        return parseFloat(ethers.formatUnits(balance, 6));
      }
    } catch (error) {
      console.error(`[Wallet] Failed to get USDT balance on ${chain}:`, error);
    }
    
    return 0;
  }
  
  getAddress(chain: string): string | null {
    if (chain === 'tron' && this.tronWeb) {
      return this.tronWeb.defaultAddress.base58;
    }
    
    if (this.evmWallets.has(chain)) {
      return this.evmWallets.get(chain)!.address;
    }
    
    return null;
  }
  
  async sendTransaction(chain: string, to: string, amount: string, _token?: string): Promise<string | null> {
    try {
      if (chain === 'tron' && this.tronWeb) {
        const tx = await this.tronWeb.trx.sendTransaction(to, parseFloat(amount) * 1e6);
        return tx.txid;
      }
      
      if (this.evmWallets.has(chain)) {
        const wallet = this.evmWallets.get(chain)!;
        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount)
        });
        return tx.hash;
      }
    } catch (error) {
      console.error(`[Wallet] Failed to send transaction on ${chain}:`, error);
    }
    
    return null;
  }
  
  isChainEnabled(chain: string): boolean {
    const wallets = this.config.wallets as any;
    const walletConfig = wallets[chain];
    return walletConfig?.enabled || false;
  }
  
  getEnabledChains(): string[] {
    return Object.entries(this.config.wallets)
      .filter(([_, config]) => config.enabled)
      .map(([chain, _]) => chain);
  }
}

// Singleton instance
let walletManager: WalletManager | null = null;

export function getWalletManager(config: Config): WalletManager {
  if (!walletManager) {
    walletManager = new WalletManager(config);
  }
  return walletManager;
}