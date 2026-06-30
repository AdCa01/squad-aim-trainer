/**
 * GET  /api/leaderboard — top 100 scores, banned users filtered out.
 * POST /api/leaderboard — submit a run; only persists if it beats the
 *   caller's existing best. Requires sign-in (any provider).
 */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      include: { user: { select: { id: true, name: true, image: true, banned: true } } },
      orderBy: { points: "desc" },
      take: 100,
    });
    const entries = scores
      .filter((s) => !s.user.banned)
      .map((s) => ({
        userId: s.user.id,
        name: s.user.name ?? "Unknown",
        avatar: s.user.image,
        score: s.points,
        hits: s.hits,
        misses: s.misses,
        accuracy: s.accuracy,
        avgReactionTime: s.avgReactionTime,
        bestReactionTime: s.bestReactionTime,
        date: s.achievedAt.toISOString(),
      }));
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.banned) {
      return NextResponse.json({ error: "Banned" }, { status: 403 });
    }

    const body = await request.json();
    const points = Math.max(0, Math.floor(Number(body.score) || 0));
    const hits = Math.max(0, Math.floor(Number(body.hits) || 0));
    const misses = Math.max(0, Math.floor(Number(body.misses) || 0));
    const accuracy = Math.max(0, Math.min(100, Math.round((Number(body.accuracy) || 0) * 10) / 10));
    const avgReactionTime = Math.max(0, Math.round(Number(body.avgReactionTime) || 0));
    const bestReactionTime = Math.max(0, Math.round(Number(body.bestReactionTime) || 0));

    const existing = await prisma.score.findUnique({ where: { userId: session.user.id } });
    if (existing && existing.points >= points) {
      return NextResponse.json({ updated: false, message: "Existing score is higher" });
    }

    await prisma.score.upsert({
      where: { userId: session.user.id },
      update: { points, hits, misses, accuracy, avgReactionTime, bestReactionTime, achievedAt: new Date() },
      create: { userId: session.user.id, points, hits, misses, accuracy, avgReactionTime, bestReactionTime },
    });

    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
