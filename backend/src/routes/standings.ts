import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLeagueStandings, getGpStandings } from '../controllers/standingsController';

const router = Router();

router.use(authenticate);

router.get('/:leagueId', getLeagueStandings);
router.get('/:leagueId/:grandPrixId', getGpStandings);

export default router;
