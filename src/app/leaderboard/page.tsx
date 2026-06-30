import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function LeaderboardPage() {
  const scores = await prisma.score.findMany({
    include: { user: { select: { id: true, name: true, image: true, banned: true } } },
    orderBy: { points: "desc" },
    take: 100,
  });
  const rows = scores.filter((s) => !s.user.banned);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-6">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-accent">Leaderboard</h1>
          <p className="text-white/40 text-sm mt-1">{rows.length} top players · sorted by score</p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-white/40">
            No scores yet. Be the first to set one!
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-bg-light overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="px-3 py-3 font-medium w-12">#</th>
                  <th className="px-3 py-3 font-medium">Player</th>
                  <th className="px-3 py-3 font-medium text-right">Score</th>
                  <th className="px-3 py-3 font-medium text-right hidden sm:table-cell">Accuracy</th>
                  <th className="px-3 py-3 font-medium text-right hidden md:table-cell">Best RT</th>
                  <th className="px-3 py-3 font-medium text-right hidden lg:table-cell">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                    <td className="px-3 py-2 text-white/40 tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      <span className="flex items-center gap-2">
                        {s.user.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.user.image} alt="" className="w-5 h-5 rounded-full" />
                        )}
                        {s.user.name ?? "Unknown"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-accent">{s.points}</td>
                    <td className="px-3 py-2 text-right text-white/60 tabular-nums hidden sm:table-cell">{s.accuracy.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right text-white/60 tabular-nums hidden md:table-cell">{s.bestReactionTime} ms</td>
                    <td className="px-3 py-2 text-right text-white/40 hidden lg:table-cell">{fmt(s.achievedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
