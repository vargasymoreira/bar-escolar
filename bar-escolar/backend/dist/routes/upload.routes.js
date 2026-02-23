"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rutas protegidas - requieren autenticación
router.post('/product', auth_middleware_1.authMiddleware, upload_middleware_1.upload.single('image'), upload_middleware_1.handleMulterError, upload_controller_1.UploadController.uploadProductImage);
router.post('/avatar', auth_middleware_1.authMiddleware, upload_middleware_1.upload.single('avatar'), upload_middleware_1.handleMulterError, upload_controller_1.UploadController.uploadAvatar);
exports.default = router;
