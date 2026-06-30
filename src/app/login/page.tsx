import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listEnabledProviderNames } from "@/auth-providers";
import { LoginButtons } from "./LoginButtons";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;
  const dest = callbackUrl ?? "/replays";
  if (session?.user) redirect(dest);

  const providers = listEnabledProviderNames();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">Sign in</h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Choose a method to access your profile.
        </p>

        {error ? (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error === "CredentialsSignin"
              ? "Invalid credentials. Try again."
              : `Sign-in error: ${error}`}
          </div>
        ) : null}

        {providers.length === 0 ? (
          <div className="rounded border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
            No authentication providers are configured. Set <code>AUTH_*</code> env vars and restart
            the viewer.
          </div>
        ) : (
          <LoginButtons providers={providers} callbackUrl={dest} />
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
