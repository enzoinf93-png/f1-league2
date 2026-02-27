import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma';

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    res.status(400).json({ error: 'email, password e username sono obbligatori' });
    return;
  }
  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      res.status(409).json({ error: 'Email o username già in uso' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, username },
      select: { id: true, email: true, username: true, role: true },
    });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user });
  } catch (e) {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email e password obbligatorie' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function me(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, username: true, role: true },
    });
    if (!user) { res.status(404).json({ error: 'Utente non trovato' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function changePassword(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Password attuale e nuova obbligatorie' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'La nuova password deve avere almeno 6 caratteri' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(401).json({ error: 'Password attuale non corretta' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });
    res.json({ message: 'Password aggiornata con successo' });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}

export async function deleteAccount(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password obbligatoria per eliminare l\'account' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Password non corretta' });
      return;
    }
    await prisma.prediction.deleteMany({ where: { userId: req.user!.id } });
    await prisma.score.deleteMany({ where: { userId: req.user!.id } });
    await prisma.leagueMember.deleteMany({ where: { userId: req.user!.id } });
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json({ message: 'Account eliminato' });
  } catch {
    res.status(500).json({ error: 'Errore del server' });
  }
}
