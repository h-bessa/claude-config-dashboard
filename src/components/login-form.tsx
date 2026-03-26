"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/login/actions";
import { Terminal } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(authenticate, null);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 ring-1 ring-white/10">
          <Terminal className="h-7 w-7 text-amber-400" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Claude Config
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter password to continue
          </p>
        </div>
      </div>

      <form action={formAction}>
        <div className="relative">
          <input
            name="password"
            type="password"
            autoFocus
            placeholder="Password"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 backdrop-blur-sm transition-all focus:border-amber-500/30 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20 transition-all hover:bg-amber-500/20 disabled:opacity-50"
          >
            {isPending ? "..." : "Enter"}
          </button>
        </div>
        {state?.error && (
          <p className="mt-3 text-center text-xs text-red-400">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
