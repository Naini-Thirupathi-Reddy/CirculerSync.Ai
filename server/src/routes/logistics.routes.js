import { Router } from 'express';
import { getPickupJobs, updateJobStatus, getOptimizedRoute } from '../controllers/logistics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/jobs', getPickupJobs);
router.patch('/jobs/:id', updateJobStatus);
router.get('/route/:date?', getOptimizedRoute);

export default router;
