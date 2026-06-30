import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();
  return (
    <nav className="border-b border-white/10 bg-bg-light/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg tracking-wide text-accent hover:text-accent-hover transition-colors">
          Squad Aim Trainer
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-white/70 hover:text-white">Play</Link>
          <Link href="/leaderboard" className="text-white/70 hover:text-white">Leaderboard</Link>
          {session?.user ? (
            <>
              <span className="text-white/40 hidden sm:inline">{session.user.name ?? session.user.email}</span>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <button type="submit" className="text-white/50 hover:text-white">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
