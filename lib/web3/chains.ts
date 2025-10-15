import type { WalletType } from "./types";

// Format wallet address based on blockchain type
export function formatAddress(
  address: string,
  type: WalletType,
  chars = 4
): string {
  if (!address) return "";

  if (type === "ethereum") {
    // Ethereum addresses are 0x... format
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  } else {
    // Solana addresses are base58 format
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
}

// Get network name based on blockchain and network ID
export function getNetworkName(chain: string, network: string | null): string {
  if (chain === "ethereum" && network) {
    return getEthereumChainName(network);
  } else if (chain === "solana" && network) {
    return getSolanaClusterName(network);
  }
  return "Unknown Network";
}

// Get Ethereum chain name from chain ID
export function getEthereumChainName(chainId: string): string {
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

// Get Solana cluster name
export function getSolanaClusterName(network: string): string {
  const clusters: Record<string, string> = {
    "mainnet-beta": "Solana Mainnet",
    "101": "Solana Mainnet",
    devnet: "Solana Devnet",
    testnet: "Solana Testnet",
  };

  return clusters[network] || `Solana ${network}`;
}

// Get blockchain display name
export function getBlockchainName(chain: string): string {
  const blockchains: Record<string, string> = {
    ethereum: "Ethereum",
    solana: "Solana",
  };

  return blockchains[chain] || chain;
}

// Get blockchain icon/symbol
export function getBlockchainSymbol(chain: string): string {
  const symbols: Record<string, string> = {
    ethereum: "Ξ",
    solana: "◎",
  };

  return symbols[chain] || "🔗";
}

// Get blockchain color for UI
export function getBlockchainColor(chain: string): string {
  const colors: Record<string, string> = {
    ethereum: "text-blue-600 dark:text-blue-400",
    solana: "text-purple-600 dark:text-purple-400",
  };

  return colors[chain] || "text-gray-600 dark:text-gray-400";
}

// Get blockchain background color for badges
export function getBlockchainBgColor(chain: string): string {
  const colors: Record<string, string> = {
    ethereum: "bg-blue-50 dark:bg-blue-900/20",
    solana: "bg-purple-50 dark:bg-purple-900/20",
  };

  return colors[chain] || "bg-gray-50 dark:bg-gray-900/20";
}
