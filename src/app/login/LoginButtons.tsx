"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import type { EnabledProvider } from "@/auth-providers";

interface Props {
  providers: EnabledProvider[];
  callbackUrl: string;
}

const ICONS: Record<string, string> = {
  discord: "Discord",
  github: "GitHub",
  google: "Google",
  steam: "Steam",
  local: "Email",
};

export function LoginButtons({ providers, callbackUrl }: Props) {
  const oauthProviders = providers.filter((p) => p.id !== "local" && p.id !== "steam");
  const hasSteam = providers.some((p) => p.id === "steam");
  const hasLocal = providers.some((p) => p.id === "local");

  return (
    <div className="flex flex-col gap-3">
      {oauthProviders.map((p) => (
        <button
          key={p.id}
          onClick={() => signIn(p.id, { callbackUrl })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <span>{ICONS[p.id] ?? "Auth"}</span>
          <span>Continue with {p.name}</span>
        </button>
      ))}

      {hasSteam ? (
        <a
          href={`/api/auth/steam/start?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <span>{ICONS.steam}</span>
          <span>Continue with Steam</span>
        </a>
      ) : null}

      {hasLocal ? <LocalForm callbackUrl={callbackUrl} /> : null}
    </div>
  );
}

function LocalForm({ callbackUrl }: { callbackUrl: string }) {
  const [mode, setMode] = useState<"signIn" | "signUp" | "forgot">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetState(nextMode: "signIn" | "signUp" | "forgot") {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/password-reset/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          setError("Password recovery is not available right now.");
          return;
        }
        setMessage("If that email exists, a password reset token has been created.");
        return;
      }

      if (mode === "signUp") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? "Could not create account.");
          return;
        }
      }

      const res = await signIn("local", { email, password, redirect: false, callbackUrl });
      if (res?.error) {
        setError("Invalid email or password.");
      } else if (res?.url) {
        window.location.href = res.url;
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-2 border-t border-slate-700 pt-4">
      {mode === "signUp" ? (
        <>
          <label className="text-xs text-slate-400" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-saf-blue focus:outline-none"
          />
        </>
      ) : null}

      <label className="text-xs text-slate-400" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-saf-blue focus:outline-none"
      />

      {mode !== "forgot" ? (
        <>
          <label className="text-xs text-slate-400" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-saf-blue focus:outline-none"
          />
        </>
      ) : null}

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-400">{message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-saf-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {pending
          ? mode === "forgot"
            ? "Sending..."
            : mode === "signUp"
              ? "Creating..."
              : "Signing in..."
          : mode === "forgot"
            ? "Recover password"
            : mode === "signUp"
              ? "Create account"
              : "Sign in"}
      </button>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => resetState(mode === "signUp" ? "signIn" : "signUp")}
          className="hover:text-slate-200"
        >
          {mode === "signUp" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
        <button
          type="button"
          onClick={() => resetState(mode === "forgot" ? "signIn" : "forgot")}
          className="hover:text-slate-200"
        >
          {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
        </button>
      </div>
    </form>
  );
}
