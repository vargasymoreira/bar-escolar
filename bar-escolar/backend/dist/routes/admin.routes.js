"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación y rol ADMIN_BAR
router.use(auth_middleware_1.authMiddleware, auth_middleware_1.isAdmin);
// Gestión de pedidos
router.get("/pedidos", adminController_1.getAllPedidos);
router.get("/pedidos/:id", adminController_1.getPedido);
router.patch("/pedidos/:id", adminController_1.updateEstadoPedido);
// Gestión de productos
router.post("/productos", adminController_1.createProducto);
router.put("/productos/:id", adminController_1.updateProducto);
router.delete("/productos/:id", adminController_1.deleteProducto);
exports.default = router;
