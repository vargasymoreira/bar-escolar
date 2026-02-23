"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const menu_routes_1 = __importDefault(require("./routes/menu.routes"));
const pedido_routes_1 = __importDefault(require("./routes/pedido.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // ← IMPORTANTE
    exposedHeaders: ["Authorization"],
}));
app.use(express_1.default.json());
// Servir archivos estáticos desde la carpeta uploads
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Rutas
app.use("/api/auth", auth_routes_1.default);
app.use("/api/menu", menu_routes_1.default);
app.use("/api/pedidos", pedido_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/stats", stats_routes_1.default);
// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ message: "API Bar Escolar funcionando correctamente" });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
