import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getMyLeagues, getAdminLeagues, createLeague, getLeagueById,
  refreshInviteCode, previewInvite, joinLeague, updateScoringConfig,
} from '../controllers/leagueController';

const router = Router();

router.use(authenticate);

router.get('/', getMyLeagues as any);
router.get('/admin', isAdmin as any, getAdminLeagues as any);
router.post('/', isAdmin as any, createLeague as any);
router.get('/join/:inviteCode', previewInvite as any);
router.post('/join/:inviteCode', joinLeague as any);
router.get('/:id', getLeagueById as any);
router.post('/:id/invite/refresh', isAdmin as any, refreshInviteCode as any);
router.put('/:id/scoring', isAdmin as any, updateScoringConfig as any);

export default router;
