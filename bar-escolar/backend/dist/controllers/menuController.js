"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducto = exports.getMenu = void 0;
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
const getMenu = async (req, res) => {
    try {
        const { categoria } = req.query;
        const productos = await prisma_service_1.default.producto.findMany({
            where: {
                disponible: true,
                ...(categoria && { categoria: categoria }),
            },
            orderBy: {
                categoria: "asc",
            },
            include: {
                variantes: true,
            },
        });
        res.json(productos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el menú" });
    }
};
exports.getMenu = getMenu;
const getProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await prisma_service_1.default.producto.findUnique({
            where: { id: parseInt(id) },
            include: {
                variantes: true,
            },
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json(producto);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el producto" });
    }
};
exports.getProducto = getProducto;
