"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBlockchainIcon } from "@/lib/web3/wallets";
import type { WalletType } from "@/lib/web3/types";

interface ChainSelectorProps {
  chains: WalletType[];
  onSelectChain: (chain: WalletType) => void;
  walletName: string;
  isLoading?: boolean;
}

export function ChainSelector({
  chains,
  onSelectChain,
  walletName,
  isLoading,
}: ChainSelectorProps) {
  // If only one chain, render a simple button
  if (chains.length === 1) {
    return (
      <Button
        onClick={() => onSelectChain(chains[0])}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Connecting...
          </div>
        ) : (
          `Connect ${walletName}`
        )}
      </Button>
    );
  }

  // Multiple chains - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </div>
          ) : (
            `Connect ${walletName}`
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuLabel>Choose Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain}
            onClick={() => onSelectChain(chain)}
            className="cursor-pointer"
          >
            <span className="mr-2 text-lg">{getBlockchainIcon(chain)}</span>
            <span className="capitalize">{chain}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
