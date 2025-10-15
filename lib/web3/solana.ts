import { createClient } from "@/lib/supabase/client";
import type {
  SolanaProvider,
  SupabaseAuthResponse,
  SupabaseAuthError,
} from "./types";

export interface DetectedSolanaWallet {
  name: string;
  icon: string;
  provider: SolanaProvider;
  uuid: string;
}

// Detect available Solana wallets
export function detectSolanaWallets(): Promise<DetectedSolanaWallet[]> {
  return new Promise((resolve) => {
    const wallets: DetectedSolanaWallet[] = [];
    const seenProviders = new Set<SolanaProvider>();

    // Check for common Solana wallet providers
    if (typeof window === "undefined") {
      resolve(wallets);
      return;
    }

    // Phantom Wallet - check window.phantom.solana first (most specific)
    if (window.phantom?.solana) {
      const provider = window.phantom.solana as SolanaProvider;
      seenProviders.add(provider);
      wallets.push({
        name: "Phantom",
        icon: "https://phantom.app/img/phantom-icon-purple.png",
        provider,
        uuid: "phantom-solana",
      });
    }

    // Standard window.solana (could be Phantom or others) - skip if already added
    if (window.solana && !seenProviders.has(window.solana)) {
      const provider = window.solana as SolanaProvider;
      const name = provider.isPhantom
        ? "Phantom"
        : provider.isSolflare
        ? "Solflare"
        : provider.isBackpack
        ? "Backpack"
        : "Solana Wallet";

      seenProviders.add(provider);
      wallets.push({
        name,
        icon: provider.isPhantom
          ? "https://phantom.app/img/phantom-icon-purple.png"
          : provider.isSolflare
          ? "https://www.solflare.com/wp-content/uploads/2024/11/App-Icon.svg"
          : provider.isBackpack
          ? "https://backpack.app/icon.png"
          : "", // Keep empty for unknown wallets
        provider,
        uuid: `solana-${name.toLowerCase()}`,
      });
    }

    // Solflare - skip if already added
    if (window.solflare && !seenProviders.has(window.solflare)) {
      const provider = window.solflare as SolanaProvider;
      seenProviders.add(provider);
      wallets.push({
        name: "Solflare",
        icon: "https://www.solflare.com/wp-content/uploads/2024/11/App-Icon.svg",
        provider,
        uuid: "solflare-solana",
      });
    }

    // Backpack - skip if already added
    if (window.backpack && !seenProviders.has(window.backpack)) {
      const provider = window.backpack as SolanaProvider;
      seenProviders.add(provider);
      wallets.push({
        name: "Backpack",
        icon: "https://backpack.app/icon.png",
        provider,
        uuid: "backpack-solana",
      });
    }

    // Brave Wallet (Solana support) - skip if already added
    if (window.braveSolana && !seenProviders.has(window.braveSolana)) {
      const provider = window.braveSolana as SolanaProvider;
      seenProviders.add(provider);
      wallets.push({
        name: "Brave Wallet",
        icon: "",
        provider,
        uuid: "brave-solana",
      });
    }

    resolve(wallets);
  });
}

// Connect to a Solana wallet
export async function connectSolanaWallet(
  provider: SolanaProvider
): Promise<string> {
  if (!provider) {
    throw new Error("No Solana wallet provider available");
  }

  try {
    // Connect to the wallet
    const response = await provider.connect();

    if (!response.publicKey) {
      throw new Error("No public key returned from wallet");
    }

    return response.publicKey.toBase58();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      }
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to connect Solana wallet: ${message}`);
  }
}

// Sign in with Solana wallet using Supabase
export async function signInWithSolana(
  provider: SolanaProvider,
  statement?: string
): Promise<{
  data: SupabaseAuthResponse | null;
  error: SupabaseAuthError | null;
}> {
  const supabase = createClient();

  try {
    // First ensure wallet is connected
    const publicKey = await connectSolanaWallet(provider);
    if (!publicKey) {
      throw new Error("No Solana wallet account available");
    }

    // Sign in with Web3
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: "solana",
      statement: statement || "Sign in to access your account",
      wallet: provider as never, // Type assertion for Supabase compatibility
    });

    return { data, error };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to sign in with Solana wallet";
    return {
      data: null,
      error: { message },
    };
  }
}

// Check if Solana wallet is connected
export async function getSolanaWalletInfo(provider: SolanaProvider) {
  try {
    if (!provider.isConnected || !provider.publicKey) {
      return null;
    }

    return {
      address: provider.publicKey.toBase58(),
      isConnected: true,
    };
  } catch (error) {
    console.error("Error getting Solana wallet info:", error);
    return null;
  }
}

// Format Solana address for display
export function formatSolanaAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Get Solana cluster name
export function getSolanaCluster(network: string): string {
  const clusters: Record<string, string> = {
    "mainnet-beta": "Solana Mainnet",
    "101": "Solana Mainnet",
    devnet: "Solana Devnet",
    testnet: "Solana Testnet",
  };

  return clusters[network] || `Solana ${network}`;
}
