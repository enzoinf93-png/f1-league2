import { Request, Response } from 'express';
import prisma from '../services/prisma';
import { calculateScoresForGp } from '../services/scoringService';
import { AuthRequest } from '../middleware/auth';

export async function getAllGrandsPrix(_req: Request, res: Response): Promise<void> {
  try {
    const gps = await prisma.grandPrix.findMany({ orderBy: [{ year: 'desc' }, { round: 'asc' }] });
    res.json(gps);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getGrandPrixById(req: Request, res: Response): Promise<void> {
  try {
    const gp = await prisma.grandPrix.findUnique({ where: { id: req.params.id } });
    if (!gp) { res.status(404).json({ error: 'GP non trovato' }); return; }

    let openFrom: Date | null = null;
    if (gp.round > 1) {
      const prevGp = await prisma.grandPrix.findFirst({ where: { year: gp.year, round: gp.round - 1 } });
      if (prevGp) {
        openFrom = new Date(prevGp.raceStart);
        openFrom.setDate(openFrom.getDate() + 1);
        openFrom.setHours(0, 0, 0, 0);
      }
    }

    res.json({ ...gp, openFrom });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function createGrandPrix(req: AuthRequest, res: Response): Promise<void> {
  const { year, round, name, country, circuit, qualifyingStart, raceStart, hasSprint } = req.body;
  if (!year || !round || !name || !country || !circuit || !qualifyingStart || !raceStart) {
    res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    return;
  }
  try {
    const gp = await prisma.grandPrix.create({
      data: {
        year, round, name, country, circuit,
        qualifyingStart: new Date(qualifyingStart),
        raceStart: new Date(raceStart),
        hasSprint: Boolean(hasSprint),
      },
    });
    res.status(201).json(gp);
  } catch {
    res.status(500).json({ error: 'Errore del server (round duplicato?)' });
  }
}

export async function updateGrandPrix(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, country, circuit, qualifyingStart, raceStart, hasSprint } = req.body;
  try {
    const gp = await prisma.grandPrix.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(country && { country }),
        ...(circuit && { circuit }),
        ...(qualifyingStart && { qualifyingStart: new Date(qualifyingStart) }),
        ...(raceStart && { raceStart: new Date(raceStart) }),
        ...(hasSprint !== undefined && { hasSprint: Boolean(hasSprint) }),
      },
    });
    res.json(gp);
  } catch {
    res.status(500).json({ error: 'GP non trovato o errore del server' });
  }
}

export async function enterResults(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { results } = req.body as {
    results: { type: string; value: string }[];
  };

  if (!Array.isArray(results) || results.length === 0) {
    res.status(400).json({ error: 'Risultati obbligatori' });
    return;
  }

  try {
    const gp = await prisma.grandPrix.findUnique({ where: { id } });
    if (!gp) { res.status(404).json({ error: 'GP non trovato' }); return; }

    for (const r of results) {
      await prisma.gpResult.upsert({
        where: { grandPrixId_type: { grandPrixId: id, type: r.type } },
        update: { value: r.value },
        create: { grandPrixId: id, type: r.type, value: r.value },
      });
    }

    await prisma.grandPrix.update({ where: { id }, data: { isResultEntered: true } });
    await calculateScoresForGp(id);

    res.json({ message: 'Risultati salvati e punteggi calcolati' });
  } catch (e) {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getResults(req: Request, res: Response): Promise<void> {
  try {
    const results = await prisma.gpResult.findMany({ where: { grandPrixId: req.params.id } });
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}
