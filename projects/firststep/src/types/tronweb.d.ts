declare module 'tronweb' {
  export default class TronWeb {
    constructor(options: {
      fullHost: string;
      privateKey?: string;
    });
    
    defaultAddress: {
      base58: string;
    };
    
    trx: {
      getBalance(address: string): Promise<number>;
      sendTransaction(to: string, amount: number): Promise<{ txid: string }>;
    };
    
    contract(): {
      at(address: string): Promise<{
        balanceOf(address: string): {
          call(): Promise<string | number>;
        };
      }>;
    };
  }
}