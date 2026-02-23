"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedidoController_1 = require("../controllers/pedidoController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.post("/", auth_middleware_1.authMiddleware, pedidoController_1.createPedido);
router.get("/mis-pedidos", auth_middleware_1.authMiddleware, pedidoController_1.getMisPedidos);
router.get("/:id", auth_middleware_1.authMiddleware, pedidoController_1.getPedido);
exports.default = router;
