import { Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import { AuthRequest } from "../types";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN_BAR") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Solo administradores." });
  }
  next();
};
