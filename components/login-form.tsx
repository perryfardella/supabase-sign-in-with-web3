"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  detectGroupedWallets,
  signInWithGroupedWallet,
  getBlockchainIcon,
  type GroupedWallet,
} from "@/lib/web3/wallets";
import { ChainSelector } from "@/components/chain-selector";
import type { WalletType } from "@/lib/web3/types";
import "@/lib/web3/types";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wallets, setWallets] = useState<GroupedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<GroupedWallet | null>(
    null
  );
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectAvailableWallets = async () => {
      try {
        const detectedWallets = await detectGroupedWallets();
        setWallets(detectedWallets);

        // Auto-select if only one wallet is available
        if (detectedWallets.length === 1) {
          setSelectedWallet(detectedWallets[0]);
        }
      } catch (error) {
        console.error("Failed to detect wallets:", error);
        setError(
          "Failed to detect Web3 wallets. Please make sure you have a wallet installed."
        );
      } finally {
        setIsDetecting(false);
      }
    };

    detectAvailableWallets();
  }, []);

  const handleChainSelect = async (
    wallet: GroupedWallet,
    chainType: WalletType
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await signInWithGroupedWallet(
        wallet,
        chainType,
        "Sign in to access your account with your Web3 wallet"
      );

      if (authError) {
        throw new Error(authError.message);
      }

      if (data?.user) {
        // Redirect to protected page on successful login
        window.location.href = "/protected";
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during wallet connection"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isDetecting) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Detecting Wallets...</CardTitle>
            <CardDescription>
              Looking for Ethereum wallets in your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">No Wallet Found</CardTitle>
            <CardDescription>
              Please install an Ethereum wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                You need a Web3 wallet to sign in. Install a wallet for Ethereum
                (like MetaMask) or Solana (like Phantom).
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => window.open("https://metamask.io/", "_blank")}
                  variant="outline"
                  className="w-full"
                >
                  Install MetaMask
                </Button>
                <Button
                  onClick={() => window.open("https://phantom.app/", "_blank")}
                  variant="outline"
                  className="w-full"
                >
                  Install Phantom
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription>
            Sign in with your Web3 wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Wallet Selection */}
            {wallets.length > 1 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Choose a wallet provider:
                </label>
                <div className="grid gap-2">
                  {wallets.map((wallet) => (
                    <Button
                      key={wallet.uuid}
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedWallet(wallet)}
                      className={cn(
                        "justify-start h-auto py-3",
                        selectedWallet?.uuid === wallet.uuid &&
                          "ring-2 ring-primary/20 bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {wallet.icon && (
                          <Image
                            src={wallet.icon.trim()}
                            alt={wallet.name}
                            width={24}
                            height={24}
                            className="rounded"
                            unoptimized
                          />
                        )}
                        <span className="font-medium">{wallet.name}</span>
                      </div>
                      {wallet.supportedChains.length > 1 ? (
                        <span className="text-xs text-muted-foreground">
                          Multi-chain
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded",
                            wallet.supportedChains[0]?.type === "ethereum"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          )}
                        >
                          {getBlockchainIcon(
                            wallet.supportedChains[0]?.type || "ethereum"
                          )}{" "}
                          {wallet.supportedChains[0]?.type === "ethereum"
                            ? "ETH"
                            : "SOL"}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chain Selector / Connect Button */}
            {selectedWallet && (
              <ChainSelector
                chains={selectedWallet.supportedChains.map((c) => c.type)}
                onSelectChain={(chain) =>
                  handleChainSelect(selectedWallet, chain)
                }
                walletName={selectedWallet.name}
                isLoading={isLoading}
              />
            )}

            {/* Auto-connect for single wallet */}
            {wallets.length === 1 && !selectedWallet && (
              <ChainSelector
                chains={wallets[0].supportedChains.map((c) => c.type)}
                onSelectChain={(chain) => handleChainSelect(wallets[0], chain)}
                walletName={wallets[0].name}
                isLoading={isLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
