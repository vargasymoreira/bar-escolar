"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rutas públicas
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
// Rutas protegidas
router.get("/profile", auth_middleware_1.authMiddleware, authController_1.getProfile);
router.put("/profile", auth_middleware_1.authMiddleware, authController_1.updateProfile);
exports.default = router;
