"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authMiddleware = void 0;
const jwt_1 = require("../config/jwt");
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};
exports.authMiddleware = authMiddleware;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== "ADMIN_BAR") {
        return res
            .status(403)
            .json({ message: "Acceso denegado. Solo administradores." });
    }
    next();
};
exports.isAdmin = isAdmin;
