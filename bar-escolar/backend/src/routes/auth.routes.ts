import { Router } from "express";
import { register, login, getProfile, updateProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router;
