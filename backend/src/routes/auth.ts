import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, (req, res: Response) => me(req as AuthRequest, res));

export default router;
