import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMyPredictions, savePredictions, getAllPredictions } from '../controllers/predictionController';

const router = Router();

router.use(authenticate);

router.get('/:grandPrixId', getMyPredictions as any);
router.post('/:grandPrixId', savePredictions as any);
router.get('/:grandPrixId/all', getAllPredictions as any);

export default router;
