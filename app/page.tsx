import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Web3 Authentication
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Connect your Ethereum or Solana wallet to get started
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
