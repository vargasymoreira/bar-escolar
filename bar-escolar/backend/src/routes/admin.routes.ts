import { Router } from "express";
import {
  getAllPedidos,
  getPedido,
  updateEstadoPedido,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../controllers/adminController";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación y rol ADMIN_BAR
router.use(authMiddleware, isAdmin);

// Gestión de pedidos
router.get("/pedidos", getAllPedidos);
router.get("/pedidos/:id", getPedido);
router.patch("/pedidos/:id", updateEstadoPedido);

// Gestión de productos
router.post("/productos", createProducto);
router.put("/productos/:id", updateProducto);
router.delete("/productos/:id", deleteProducto);

export default router;
