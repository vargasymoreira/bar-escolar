import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Todas las rutas requieren autenticación de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Estadísticas
router.get('/sales-by-day', StatsController.getSalesByDay);
router.get('/best-selling', StatsController.getBestSelling);
router.get('/revenue', StatsController.getRevenue);
router.get('/peak-hours', StatsController.getPeakHours);
router.get('/categories', StatsController.getSalesByCategory);
router.get('/summary', StatsController.getDashboardSummary);

export default router;
