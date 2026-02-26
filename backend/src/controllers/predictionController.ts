import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

const DEADLINE_MINUTES = 10;

function isDeadlinePassed(qualifyingStart: Date): boolean {
  const deadline = new Date(qualifyingStart.getTime() - DEADLINE_MINUTES * 60 * 1000);
  return new Date() >= deadline;
}

export async function getMyPredictions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const predictions = await prisma.prediction.findMany({
      where: { userId: req.user!.id, grandPrixId: req.params.grandPrixId },
    });
    res.json(predictions);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function savePredictions(req: AuthRequest, res: Response): Promise<void> {
  const { grandPrixId } = req.params;
  const { predictions } = req.body as {
    predictions: { type: string; value: string }[];
  };

  if (!Array.isArray(predictions)) {
    res.status(400).json({ error: 'predictions deve essere un array' });
    return;
  }

  try {
    const gp = await prisma.grandPrix.findUnique({ where: { id: grandPrixId } });
    if (!gp) { res.status(404).json({ error: 'GP non trovato' }); return; }

    if (isDeadlinePassed(gp.qualifyingStart)) {
      res.status(403).json({ error: 'Deadline superata: previsioni chiuse 10 minuti prima delle qualifiche' });
      return;
    }

    const saved = [];
    for (const p of predictions) {
      const pred = await prisma.prediction.upsert({
        where: { userId_grandPrixId_type: { userId: req.user!.id, grandPrixId, type: p.type } },
        update: { value: p.value },
        create: { userId: req.user!.id, grandPrixId, type: p.type, value: p.value },
      });
      saved.push(pred);
    }
    res.json(saved);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getAllPredictions(req: AuthRequest, res: Response): Promise<void> {
  const { grandPrixId } = req.params;
  try {
    const gp = await prisma.grandPrix.findUnique({ where: { id: grandPrixId } });
    if (!gp) { res.status(404).json({ error: 'GP non trovato' }); return; }

    if (!isDeadlinePassed(gp.qualifyingStart) && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Le previsioni degli altri saranno visibili dopo le qualifiche' });
      return;
    }

    const predictions = await prisma.prediction.findMany({
      where: { grandPrixId },
      include: { user: { select: { id: true, username: true } } },
    });
    res.json(predictions);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}
