import { Router } from 'express';
import { login, register, getProfile } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);

export default router;
