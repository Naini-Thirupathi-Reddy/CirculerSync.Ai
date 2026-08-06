import { Router } from 'express';
import { getMatches, getMyMatches, acceptMatch } from '../controllers/matches.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMatches);
router.get('/my', getMyMatches);
router.post('/:id/accept', acceptMatch);

export default router;
