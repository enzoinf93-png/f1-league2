import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getAllGrandsPrix, getGrandPrixById, createGrandPrix,
  updateGrandPrix, enterResults, getResults,
} from '../controllers/grandPrixController';

const router = Router();

router.get('/', getAllGrandsPrix);
router.get('/:id', getGrandPrixById);
router.get('/:id/results', getResults);
router.post('/', authenticate, isAdmin as any, createGrandPrix as any);
router.put('/:id', authenticate, isAdmin as any, updateGrandPrix as any);
router.put('/:id/results', authenticate, isAdmin as any, enterResults as any);

export default router;
