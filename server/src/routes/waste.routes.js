import { Router } from 'express';
import { getWasteStreams, createWasteStream, getWasteStreamById, deleteWasteStream } from '../controllers/waste.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getWasteStreams);
router.post('/', createWasteStream);
router.get('/:id', getWasteStreamById);
router.delete('/:id', deleteWasteStream);

export default router;
