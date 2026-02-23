import { Router } from "express";
import { getMenu, getProducto } from "../controllers/menuController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Rutas protegidas (solo usuarios autenticados)
router.get("/", authMiddleware, getMenu);
router.get("/:id", authMiddleware, getProducto);

export default router;
