// Extend the Window interface to include Ethereum providers
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isWalletConnect?: boolean;
    };
    // Other common wallet providers
    braveSolana?: any;
    phantom?: any;
  }
}

export {};
