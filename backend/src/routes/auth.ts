import { Router } from 'express';
import { register, login, me, changePassword, deleteAccount } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, (req, res: Response) => me(req as AuthRequest, res));
router.put('/change-password', authenticate, (req, res: Response) => changePassword(req as AuthRequest, res));
router.delete('/delete-account', authenticate, (req, res: Response) => deleteAccount(req as AuthRequest, res));

export default router;
