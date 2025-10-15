"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import {
  formatAddress,
  getNetworkName,
  getBlockchainSymbol,
  getBlockchainName,
} from "@/lib/web3/chains";
import type { Web3CustomClaims } from "@/lib/web3/types";

interface WalletData {
  address: string;
  chainId: string | null;
  statement: string;
  domain: string;
  chain: string;
  rawClaims: Web3CustomClaims;
}

export function WalletInfo() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const supabase = createClient();

        // Get user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("No user found");
        }

        // Get claims
        const { data: claimsData, error: claimsError } =
          await supabase.auth.getClaims();
        if (claimsError) {
          throw new Error(`Claims error: ${claimsError.message}`);
        }

        console.log("Client-side claims data:", claimsData);
        console.log(
          "Client-side custom claims:",
          claimsData?.claims?.user_metadata?.custom_claims
        );

        const customClaims = claimsData?.claims?.user_metadata
          ?.custom_claims as Web3CustomClaims | undefined;

        if (!customClaims) {
          throw new Error("No Web3 claims found");
        }

        const chain = customClaims.chain || "ethereum";
        const chainId =
          chain === "ethereum"
            ? `0x${parseInt(customClaims.network).toString(16)}`
            : customClaims.network;

        setWalletData({
          address: customClaims.address,
          chainId,
          statement: customClaims.statement,
          domain: customClaims.domain,
          chain,
          rawClaims: customClaims,
        });
      } catch (err) {
        console.error("Error fetching wallet info:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletInfo();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Wallet Info...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Wallet Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">
            {walletData ? getBlockchainSymbol(walletData.chain) : "🔗"}
          </span>
          Connected Wallet (Client-Side)
        </CardTitle>
        <CardDescription>
          Your {walletData ? getBlockchainName(walletData.chain) : "Web3"}{" "}
          wallet information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Wallet Address
          </label>
          <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-sm">
            {walletData?.address ? (
              <div className="flex items-center justify-between">
                <span>
                  {formatAddress(
                    walletData.address,
                    walletData.chain === "ethereum" ? "ethereum" : "solana",
                    6
                  )}
                </span>
                <CopyButton text={walletData.address} />
              </div>
            ) : (
              <div>Not available</div>
            )}
          </div>
        </div>

        {walletData?.chainId && (
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Network
            </label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
              {getNetworkName(walletData.chain, walletData.chainId)}
            </div>
          </div>
        )}

        {walletData?.statement && (
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Sign-in Statement
            </label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
              {walletData.statement}
            </div>
          </div>
        )}

        {walletData?.domain && (
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Domain
            </label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
              {walletData.domain}
            </div>
          </div>
        )}

        {walletData?.chain && (
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Blockchain
            </label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm capitalize">
              {walletData.chain}
            </div>
          </div>
        )}

        {walletData?.rawClaims && (
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Raw Claims (Client-Side)
            </label>
            <pre className="mt-1 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
              {JSON.stringify(walletData.rawClaims, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
