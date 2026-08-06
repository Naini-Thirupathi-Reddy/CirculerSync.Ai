import { Router } from 'express';
import { getNetworkMembers, getMaterialFlows, getSymbiosisGaps } from '../controllers/network.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/members', getNetworkMembers);
router.get('/flows', getMaterialFlows);
router.get('/gaps', getSymbiosisGaps);

export default router;
