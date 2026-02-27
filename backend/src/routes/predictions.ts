import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { getMyPredictions, savePredictions, getAllPredictions, deleteUserPredictions } from '../controllers/predictionController';

const router = Router();

router.use(authenticate);

router.get('/:grandPrixId', getMyPredictions as any);
router.post('/:grandPrixId', savePredictions as any);
router.get('/:grandPrixId/all', getAllPredictions as any);
router.delete('/:grandPrixId/user/:userId', isAdmin as any, deleteUserPredictions as any);

export default router;
