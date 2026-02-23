"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación de admin
router.use(auth_middleware_1.authMiddleware);
router.use(admin_middleware_1.adminMiddleware);
// Estadísticas
router.get('/sales-by-day', stats_controller_1.StatsController.getSalesByDay);
router.get('/best-selling', stats_controller_1.StatsController.getBestSelling);
router.get('/revenue', stats_controller_1.StatsController.getRevenue);
router.get('/peak-hours', stats_controller_1.StatsController.getPeakHours);
router.get('/categories', stats_controller_1.StatsController.getSalesByCategory);
router.get('/summary', stats_controller_1.StatsController.getDashboardSummary);
exports.default = router;
