import { createClient } from "@/lib/supabase/client";

// EIP-6963 wallet discovery types
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

export interface DetectedWallet {
  name: string;
  icon: string;
  provider: any;
  uuid: string;
}

// Detect available Ethereum wallets using EIP-6963 standard
export function detectWallets(): Promise<DetectedWallet[]> {
  return new Promise((resolve) => {
    const wallets: DetectedWallet[] = [];

    // Listen for EIP-6963 wallet announcements
    const handleAnnouncement = (event: CustomEvent<EIP6963ProviderDetail>) => {
      const { info, provider } = event.detail;
      wallets.push({
        name: info.name,
        icon: info.icon,
        provider,
        uuid: info.uuid,
      });
    };

    window.addEventListener(
      "eip6963:announceProvider",
      handleAnnouncement as EventListener
    );

    // Request wallet announcements
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Give wallets time to respond, then check for legacy window.ethereum
    setTimeout(() => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleAnnouncement as EventListener
      );

      // Fallback to window.ethereum if no EIP-6963 wallets found
      if (
        wallets.length === 0 &&
        typeof window !== "undefined" &&
        window.ethereum
      ) {
        wallets.push({
          name: "Ethereum Wallet",
          icon: "", // No icon for legacy detection
          provider: window.ethereum,
          uuid: "legacy-ethereum",
        });
      }

      resolve(wallets);
    }, 100);
  });
}

// Connect to a specific wallet
export async function connectWallet(provider: any): Promise<string[]> {
  if (!provider) {
    throw new Error("No wallet provider available");
  }

  try {
    // Request account access
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from wallet");
    }

    return accounts;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
}

// Get the current chain ID
export async function getChainId(provider: any): Promise<string> {
  try {
    const chainId = await provider.request({
      method: "eth_chainId",
    });
    return chainId;
  } catch (error: any) {
    throw new Error(`Failed to get chain ID: ${error.message}`);
  }
}

// Sign in with Web3 using Supabase
export async function signInWithEthereum(
  provider: any,
  statement?: string
): Promise<{ data: any; error: any }> {
  const supabase = createClient();

  try {
    // First ensure wallet is connected
    const accounts = await connectWallet(provider);
    if (!accounts || accounts.length === 0) {
      throw new Error("No wallet accounts available");
    }

    // Sign in with Web3
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: "ethereum",
      statement: statement || "Sign in to access your account",
      wallet: provider,
    });

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || "Failed to sign in with Ethereum wallet",
      },
    };
  }
}

// Check if user is connected and get account info
export async function getWalletInfo(provider: any) {
  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });

    if (!accounts || accounts.length === 0) {
      return null;
    }

    const chainId = await getChainId(provider);

    return {
      address: accounts[0],
      chainId,
      isConnected: true,
    };
  } catch (error) {
    return null;
  }
}

// Format wallet address for display
export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Get chain name from chain ID
export function getChainName(chainId: string): string {
  const chains: Record<string, string> = {
    "0x1": "Ethereum Mainnet",
    "0x89": "Polygon",
    "0xa": "Optimism",
    "0xa4b1": "Arbitrum One",
    "0x2105": "Base",
    "0xaa36a7": "Sepolia Testnet",
    "0x5": "Goerli Testnet",
  };

  return chains[chainId] || `Chain ${parseInt(chainId, 16)}`;
}
