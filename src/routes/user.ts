import { Router } from 'express';
import UserController from '../controller/UserController';

const router = Router();

router.post('/', UserController.createUser);

export default router;