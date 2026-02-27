import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import leagueRoutes from './routes/leagues';
import grandPrixRoutes from './routes/grandsPrix';
import predictionRoutes from './routes/predictions';
import standingsRoutes from './routes/standings';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/grands-prix', grandPrixRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/standings', standingsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`F1 League backend running on port ${PORT}`);
});

export default app;
