import { Router } from "express";
import {
  createPedido,
  getMisPedidos,
  getPedido,
} from "../controllers/pedidoController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.post("/", authMiddleware, createPedido);
router.get("/mis-pedidos", authMiddleware, getMisPedidos);
router.get("/:id", authMiddleware, getPedido);

export default router;
