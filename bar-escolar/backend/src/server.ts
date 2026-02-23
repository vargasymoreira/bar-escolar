import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes";
import menuRoutes from "./routes/menu.routes";
import pedidoRoutes from "./routes/pedido.routes";
import adminRoutes from "./routes/admin.routes";
import uploadRoutes from "./routes/upload.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // ← IMPORTANTE
    exposedHeaders: ["Authorization"],
  })
);
app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API Bar Escolar funcionando correctamente" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
