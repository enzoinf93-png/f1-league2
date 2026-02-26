import { Request, Response } from 'express';
import prisma from '../services/prisma';

export async function getLeagueStandings(req: Request, res: Response): Promise<void> {
  const { leagueId } = req.params;
  try {
    const scores = await prisma.score.groupBy({
      by: ['userId'],
      where: { leagueId },
      _sum: { points: true },
    });

    const userIds = scores.map((s) => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    const standings = scores
      .map((s) => ({
        userId: s.userId,
        username: userMap.get(s.userId) || 'Unknown',
        totalPoints: s._sum.points || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, position: i + 1 }));

    res.json(standings);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getGpStandings(req: Request, res: Response): Promise<void> {
  const { leagueId, grandPrixId } = req.params;
  try {
    const scores = await prisma.score.findMany({
      where: { leagueId, grandPrixId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { points: 'desc' },
    });

    const standings = scores.map((s, i) => ({
      position: i + 1,
      userId: s.userId,
      username: s.user.username,
      points: s.points,
      breakdown: typeof s.breakdown === 'string' ? JSON.parse(s.breakdown) : s.breakdown,
    }));

    res.json(standings);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}
