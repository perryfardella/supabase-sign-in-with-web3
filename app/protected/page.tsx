import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { CopyButton } from "@/components/copy-button";
import { WalletInfo } from "@/components/wallet-info";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAddress, getChainName } from "@/lib/web3/ethereum";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/");
  }

  // Get Web3 claims information
  const { data: claimsData } = await supabase.auth.getClaims();
  const customClaims = claimsData?.claims?.user_metadata?.custom_claims;

  // Debug logging
  console.log("Claims data:", claimsData);
  console.log("Custom claims:", customClaims);

  // Extract Web3 information from custom claims
  const walletAddress = customClaims?.address;
  const chainId = customClaims?.network
    ? `0x${parseInt(customClaims.network).toString(16)}`
    : null;
  const statement = customClaims?.statement;
  const domain = customClaims?.domain;
  const chain = customClaims?.chain;

  // Debug the extracted values
  console.log("Extracted wallet address:", walletAddress);
  console.log("Extracted chain ID:", chainId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome Back!
          </h1>
          <LogoutButton />
        </div>

        <div className="grid gap-6">
          {/* Client-Side Wallet Information */}
          <WalletInfo />

          {/* Server-Side Wallet Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Connected Wallet (Server-Side)
              </CardTitle>
              <CardDescription>
                Your Ethereum wallet information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Wallet Address
                </label>
                <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-sm">
                  {walletAddress ? (
                    <div className="flex items-center justify-between">
                      <span>{formatAddress(walletAddress, 6)}</span>
                      <CopyButton text={walletAddress} />
                    </div>
                  ) : (
                    <div>
                      <div>Not available</div>
                      <div className="text-xs text-red-500 mt-1">
                        {`Debug: walletAddress = ${String(walletAddress)},
                        customClaims = ${customClaims ? "exists" : "null"}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {chainId && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Network
                  </label>
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                    {getChainName(chainId)}
                  </div>
                </div>
              )}

              {statement && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Sign-in Statement
                  </label>
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                    {statement}
                  </div>
                </div>
              )}

              {domain && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Domain
                  </label>
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                    {domain}
                  </div>
                </div>
              )}

              {chain && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Blockchain
                  </label>
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm capitalize">
                    {chain}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Account details from Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  User ID
                </label>
                <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-sm">
                  {user.id}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Created At
                </label>
                <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                  {new Date(user.created_at).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Last Sign In
                </label>
                <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Never"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Web3 Claims Information Card */}
          {customClaims && (
            <Card>
              <CardHeader>
                <CardTitle>Web3 Claims</CardTitle>
                <CardDescription>
                  Custom claims from Web3 authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                  {JSON.stringify(customClaims, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Identity Information Card */}
          {user.identities && user.identities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Identity Information</CardTitle>
                <CardDescription>
                  Authentication provider details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.identities.map((identity, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">
                          {identity.provider}
                        </span>
                        <span className="text-xs text-slate-500">
                          {identity.created_at
                            ? new Date(identity.created_at).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                      {identity.identity_data && (
                        <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                          {JSON.stringify(identity.identity_data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
