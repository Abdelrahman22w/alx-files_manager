import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// AppController endpoint definitions
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// UsersController endpoint definitions
router.post('/users', UsersController.postNew);

export default router;
