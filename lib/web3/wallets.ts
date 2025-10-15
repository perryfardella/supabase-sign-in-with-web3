import type {
  WalletProvider,
  WalletType,
  SupabaseAuthResponse,
  SupabaseAuthError,
} from "./types";
import { detectWallets as detectEthereumWallets } from "./ethereum";
import { detectSolanaWallets } from "./solana";
import { signInWithEthereum } from "./ethereum";
import { signInWithSolana } from "./solana";
import { isEthereumProvider, isSolanaProvider } from "./types";

// Unified wallet interface for both Ethereum and Solana
export interface UnifiedWallet {
  name: string;
  icon: string;
  provider: WalletProvider;
  type: WalletType;
  uuid: string;
}

// Grouped wallet interface - shows wallet once with multiple chain support
export interface GroupedWallet {
  name: string;
  icon: string;
  uuid: string;
  supportedChains: {
    type: WalletType;
    provider: WalletProvider;
    originalUuid: string;
  }[];
}

// Detect all available wallets (Ethereum and Solana) - separate entries per chain
export async function detectAllWallets(): Promise<UnifiedWallet[]> {
  const [ethereumWallets, solanaWallets] = await Promise.all([
    detectEthereumWallets(),
    detectSolanaWallets(),
  ]);

  const unifiedWallets: UnifiedWallet[] = [];

  // Add Ethereum wallets with (Ethereum) suffix
  for (const wallet of ethereumWallets) {
    unifiedWallets.push({
      name: `${wallet.name} (Ethereum)`,
      icon: wallet.icon,
      provider: wallet.provider,
      type: "ethereum",
      uuid: wallet.uuid,
    });
  }

  // Add Solana wallets with (Solana) suffix
  for (const wallet of solanaWallets) {
    unifiedWallets.push({
      name: `${wallet.name} (Solana)`,
      icon: wallet.icon,
      provider: wallet.provider,
      type: "solana",
      uuid: wallet.uuid,
    });
  }

  return unifiedWallets;
}

// Detect wallets grouped by name - shows each wallet once with chain support
export async function detectGroupedWallets(): Promise<GroupedWallet[]> {
  const [ethereumWallets, solanaWallets] = await Promise.all([
    detectEthereumWallets(),
    detectSolanaWallets(),
  ]);

  const walletMap = new Map<string, GroupedWallet>();

  // Add Ethereum wallets
  for (const wallet of ethereumWallets) {
    if (!walletMap.has(wallet.name)) {
      walletMap.set(wallet.name, {
        name: wallet.name,
        icon: wallet.icon,
        uuid: wallet.name.toLowerCase().replace(/\s+/g, "-"),
        supportedChains: [],
      });
    }
    walletMap.get(wallet.name)!.supportedChains.push({
      type: "ethereum",
      provider: wallet.provider,
      originalUuid: wallet.uuid,
    });
  }

  // Add Solana wallets
  for (const wallet of solanaWallets) {
    if (!walletMap.has(wallet.name)) {
      walletMap.set(wallet.name, {
        name: wallet.name,
        icon: wallet.icon,
        uuid: wallet.name.toLowerCase().replace(/\s+/g, "-"),
        supportedChains: [],
      });
    }
    walletMap.get(wallet.name)!.supportedChains.push({
      type: "solana",
      provider: wallet.provider,
      originalUuid: wallet.uuid,
    });
  }

  return Array.from(walletMap.values());
}

// Sign in with any wallet (automatically routes to correct blockchain)
export async function signInWithWallet(
  wallet: UnifiedWallet,
  statement?: string
): Promise<{
  data: SupabaseAuthResponse | null;
  error: SupabaseAuthError | null;
}> {
  if (wallet.type === "ethereum" && isEthereumProvider(wallet.provider)) {
    return signInWithEthereum(wallet.provider, statement);
  } else if (wallet.type === "solana" && isSolanaProvider(wallet.provider)) {
    return signInWithSolana(wallet.provider, statement);
  } else {
    return {
      data: null,
      error: {
        message: "Unsupported wallet type",
      },
    };
  }
}

// Sign in with a grouped wallet using a specific chain
export async function signInWithGroupedWallet(
  wallet: GroupedWallet,
  chainType: WalletType,
  statement?: string
): Promise<{
  data: SupabaseAuthResponse | null;
  error: SupabaseAuthError | null;
}> {
  const chain = wallet.supportedChains.find((c) => c.type === chainType);

  if (!chain) {
    return {
      data: null,
      error: {
        message: `${wallet.name} does not support ${chainType}`,
      },
    };
  }

  if (chainType === "ethereum" && isEthereumProvider(chain.provider)) {
    return signInWithEthereum(chain.provider, statement);
  } else if (chainType === "solana" && isSolanaProvider(chain.provider)) {
    return signInWithSolana(chain.provider, statement);
  } else {
    return {
      data: null,
      error: {
        message: "Unsupported wallet type",
      },
    };
  }
}

// Get blockchain type from wallet
export function getWalletBlockchain(wallet: UnifiedWallet): string {
  return wallet.type === "ethereum" ? "Ethereum" : "Solana";
}

// Get blockchain icon/emoji
export function getBlockchainIcon(type: WalletType): string {
  return type === "ethereum" ? "Ξ" : "◎";
}

// Get blockchain color for badges
export function getBlockchainColor(type: WalletType): string {
  return type === "ethereum" ? "text-blue-600" : "text-purple-600";
}
