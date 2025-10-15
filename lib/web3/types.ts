// EIP-1193 Request/Response types
export type EthereumRequestMethod =
  | "eth_requestAccounts"
  | "eth_accounts"
  | "eth_chainId"
  | "eth_sendTransaction"
  | "personal_sign"
  | "eth_signTypedData_v4"
  | string; // Allow other methods

export interface EthereumRequestParams {
  method: EthereumRequestMethod;
  params?: unknown[] | Record<string, unknown>;
}

// Specific response types for common methods
export type EthereumResponse<T extends EthereumRequestMethod> = T extends
  | "eth_requestAccounts"
  | "eth_accounts"
  ? string[]
  : T extends "eth_chainId"
  ? string
  : T extends "eth_sendTransaction"
  ? string
  : unknown;

// EIP-1193 Ethereum Provider interface
export interface EthereumProvider {
  request<T extends EthereumRequestMethod = EthereumRequestMethod>(args: {
    method: T;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<EthereumResponse<T>>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    callback: (...args: unknown[]) => void
  ) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
}

// Solana Provider interface
export interface SolanaProvider {
  publicKey: { toBase58(): string } | null;
  isConnected: boolean;
  connect(): Promise<{ publicKey: { toBase58(): string } }>;
  disconnect(): Promise<void>;
  signMessage(
    message: Uint8Array,
    display?: string
  ): Promise<{ signature: Uint8Array }>;
  isPhantom?: boolean;
  isBraveWallet?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
}

// Union type for all wallet providers
export type WalletProvider = EthereumProvider | SolanaProvider;

// Wallet type discriminator
export type WalletType = "ethereum" | "solana";

// Type guard for Ethereum providers
export function isEthereumProvider(
  provider: WalletProvider
): provider is EthereumProvider {
  return "request" in provider;
}

// Type guard for Solana providers
export function isSolanaProvider(
  provider: WalletProvider
): provider is SolanaProvider {
  return "signMessage" in provider && "publicKey" in provider;
}

// Supabase Auth types
export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  identities?: SupabaseIdentity[];
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export interface SupabaseIdentity {
  id: string;
  user_id: string;
  identity_data?: Record<string, unknown>;
  provider: string;
  created_at?: string;
  last_sign_in_at?: string;
  updated_at?: string;
}

export interface SupabaseAuthResponse {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
}

export interface SupabaseAuthError {
  message: string;
  status?: number;
  code?: string;
}

// Web3 Custom Claims from JWT
export interface Web3CustomClaims {
  address: string;
  chain: string;
  domain: string;
  network: string;
  statement: string;
}

export interface SupabaseJWTClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: {
    custom_claims?: Web3CustomClaims;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
  role: string;
  aal: string;
  amr?: Array<{ method: string; timestamp: number }>;
  session_id: string;
  is_anonymous: boolean;
}

// Extend the Window interface to include wallet providers
declare global {
  interface Window {
    // Ethereum providers
    ethereum?: EthereumProvider;
    // Solana providers
    solana?: SolanaProvider;
    phantom?: { solana?: SolanaProvider };
    solflare?: SolanaProvider;
    backpack?: SolanaProvider;
    braveSolana?: SolanaProvider;
  }
}

export {};
