"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuController_1 = require("../controllers/menuController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rutas protegidas (solo usuarios autenticados)
router.get("/", auth_middleware_1.authMiddleware, menuController_1.getMenu);
router.get("/:id", auth_middleware_1.authMiddleware, menuController_1.getProducto);
exports.default = router;
