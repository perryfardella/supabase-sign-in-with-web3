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
  detectWallets,
  signInWithEthereum,
  type DetectedWallet,
} from "@/lib/web3/ethereum";
import "@/lib/web3/types";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<DetectedWallet | null>(
    null
  );
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectAvailableWallets = async () => {
      try {
        const detectedWallets = await detectWallets();
        setWallets(detectedWallets);

        // Auto-select if only one wallet is available
        if (detectedWallets.length === 1) {
          setSelectedWallet(detectedWallets[0]);
        }
      } catch (error) {
        console.error("Failed to detect wallets:", error);
        setError(
          "Failed to detect Ethereum wallets. Please make sure you have a wallet installed."
        );
      } finally {
        setIsDetecting(false);
      }
    };

    detectAvailableWallets();
  }, []);

  const handleWalletLogin = async (wallet: DetectedWallet) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await signInWithEthereum(
        wallet.provider,
        "Sign in to access your account with your Ethereum wallet"
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

  const handleConnectWallet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedWallet) {
      await handleWalletLogin(selectedWallet);
    } else if (wallets.length > 0) {
      // If multiple wallets, use the first one as default
      await handleWalletLogin(wallets[0]);
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
                You need an Ethereum wallet like MetaMask, Coinbase Wallet, or
                WalletConnect to sign in.
              </p>
              <Button
                onClick={() => window.open("https://metamask.io/", "_blank")}
                variant="outline"
                className="w-full"
              >
                Install MetaMask
              </Button>
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
            Sign in with your Ethereum wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnectWallet}>
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
                    Choose a wallet:
                  </label>
                  <div className="grid gap-2">
                    {wallets.map((wallet) => (
                      <Button
                        key={wallet.uuid}
                        type="button"
                        variant={
                          selectedWallet?.uuid === wallet.uuid
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedWallet(wallet)}
                        className={cn(
                          "justify-start h-auto py-3",
                          selectedWallet?.uuid === wallet.uuid &&
                            "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        {wallet.icon && (
                          <Image
                            src={wallet.icon}
                            alt={wallet.name}
                            width={24}
                            height={24}
                            className="rounded"
                            unoptimized
                          />
                        )}
                        <span className="font-medium">{wallet.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (wallets.length > 1 && !selectedWallet)}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </div>
                ) : (
                  `Connect ${
                    selectedWallet?.name || wallets[0]?.name || "Wallet"
                  }`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
