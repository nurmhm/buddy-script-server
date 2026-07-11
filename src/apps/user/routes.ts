import { validate } from '@/middleware/validate';
import { Router } from 'express';
import { AuthController } from './controllers';
import { ZLogin, ZRegister } from './validators';

// ------------------ AUTH ROUTES ------------------
const authRouter = Router();
const authController = new AuthController();

authRouter.post('/auth/login', validate(ZLogin), authController.login);
authRouter.post('/auth/register', validate(ZRegister), authController.register);
authRouter.post('/auth/refresh', authController.refreshToken);
authRouter.post('/auth/logout', authController.logout);

// ------------------ EXPORT ------------------
export { authRouter };
