import { Router } from 'express';
import { getPersonalImpact, getCommunityImpact, getESGReportData } from '../controllers/impact.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/personal', getPersonalImpact);
router.get('/community', getCommunityImpact);
router.get('/report', getESGReportData);

export default router;
