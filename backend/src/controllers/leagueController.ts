import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getMyLeagues(req: AuthRequest, res: Response): Promise<void> {
  try {
    const memberships = await prisma.leagueMember.findMany({
      where: { userId: req.user!.id },
      include: {
        league: {
          include: {
            admin: { select: { username: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });
    const leagues = memberships.map((m) => ({
      ...m.league,
      memberCount: m.league._count.members,
      joinedAt: m.joinedAt,
    }));
    res.json(leagues);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getAdminLeagues(req: AuthRequest, res: Response): Promise<void> {
  try {
    const leagues = await prisma.league.findMany({
      where: { adminId: req.user!.id },
      include: {
        _count: { select: { members: true } },
        scoringConfig: true,
      },
    });
    res.json(leagues);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function createLeague(req: AuthRequest, res: Response): Promise<void> {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Nome lega obbligatorio' }); return; }
  try {
    const league = await prisma.league.create({
      data: {
        name,
        adminId: req.user!.id,
        members: { create: { userId: req.user!.id } },
        scoringConfig: { create: {} },
      },
    });
    res.status(201).json(league);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getLeagueById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, username: true } },
        members: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
        scoringConfig: true,
      },
    });
    if (!league) { res.status(404).json({ error: 'Lega non trovata' }); return; }
    const isMember = league.members.some((m) => m.userId === req.user!.id);
    const isAdmin = league.adminId === req.user!.id;
    if (!isMember && !isAdmin) { res.status(403).json({ error: 'Non sei membro di questa lega' }); return; }
    res.json(league);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function refreshInviteCode(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const league = await prisma.league.findUnique({ where: { id } });
    if (!league) { res.status(404).json({ error: 'Lega non trovata' }); return; }
    if (league.adminId !== req.user!.id) { res.status(403).json({ error: 'Solo l\'admin può rigenerare il link' }); return; }
    const updated = await prisma.league.update({
      where: { id },
      data: { inviteCode: uuidv4() },
    });
    res.json({ inviteCode: updated.inviteCode });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function previewInvite(req: AuthRequest, res: Response): Promise<void> {
  const { inviteCode } = req.params;
  try {
    const league = await prisma.league.findUnique({
      where: { inviteCode },
      include: {
        admin: { select: { username: true } },
        _count: { select: { members: true } },
      },
    });
    if (!league) { res.status(404).json({ error: 'Link di invito non valido' }); return; }
    res.json({ id: league.id, name: league.name, admin: league.admin, memberCount: league._count.members });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function joinLeague(req: AuthRequest, res: Response): Promise<void> {
  const { inviteCode } = req.params;
  try {
    const league = await prisma.league.findUnique({ where: { inviteCode } });
    if (!league) { res.status(404).json({ error: 'Link di invito non valido' }); return; }
    const exists = await prisma.leagueMember.findUnique({
      where: { leagueId_userId: { leagueId: league.id, userId: req.user!.id } },
    });
    if (exists) { res.status(409).json({ error: 'Sei già membro di questa lega' }); return; }
    await prisma.leagueMember.create({ data: { leagueId: league.id, userId: req.user!.id } });
    res.json({ message: 'Iscrizione completata', leagueId: league.id });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function updateScoringConfig(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const league = await prisma.league.findUnique({ where: { id } });
    if (!league) { res.status(404).json({ error: 'Lega non trovata' }); return; }
    if (league.adminId !== req.user!.id) { res.status(403).json({ error: 'Solo l\'admin può modificare il punteggio' }); return; }
    const config = await prisma.scoringConfig.upsert({
      where: { leagueId: id },
      update: req.body,
      create: { leagueId: id, ...req.body },
    });
    res.json(config);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}
