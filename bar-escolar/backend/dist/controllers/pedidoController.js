"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPedido = exports.getMisPedidos = exports.createPedido = void 0;
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
const library_1 = require("@prisma/client/runtime/library");
const createPedido = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { items, observaciones } = req.body;
        if (!items || items.length === 0) {
            return res
                .status(400)
                .json({ message: "El pedido debe tener al menos un producto" });
        }
        // Calcular el total del pedido
        let total = new library_1.Decimal(0);
        const pedidoItems = [];
        for (const item of items) {
            const producto = await prisma_service_1.default.producto.findUnique({
                where: { id: item.productoId },
            });
            if (!producto) {
                return res
                    .status(404)
                    .json({ message: `Producto ${item.productoId} no encontrado` });
            }
            if (!producto.disponible) {
                return res
                    .status(400)
                    .json({ message: `Producto ${producto.nombre} no disponible` });
            }
            const subtotal = producto.precio.mul(item.cantidad);
            total = total.add(subtotal);
            pedidoItems.push({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal,
            });
        }
        // Crear el pedido con sus items
        const pedido = await prisma_service_1.default.pedido.create({
            data: {
                userId: userId,
                total,
                observaciones,
                items: {
                    create: pedidoItems,
                },
            },
            include: {
                items: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        res.status(201).json({
            message: "Pedido creado exitosamente",
            pedido,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el pedido" });
    }
};
exports.createPedido = createPedido;
const getMisPedidos = async (req, res) => {
    try {
        const userId = req.user?.id;
        const pedidos = await prisma_service_1.default.pedido.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        producto: true,
                    },
                },
            },
            orderBy: {
                fechaPedido: "desc",
            },
        });
        // Convert Decimal to number for JSON serialization
        const pedidosFormatted = pedidos.map(pedido => ({
            ...pedido,
            total: Number(pedido.total),
            items: pedido.items.map(item => ({
                ...item,
                precioUnitario: Number(item.precioUnitario),
                subtotal: Number(item.subtotal),
                producto: {
                    ...item.producto,
                    precio: Number(item.producto.precio)
                }
            }))
        }));
        res.json(pedidosFormatted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los pedidos" });
    }
};
exports.getMisPedidos = getMisPedidos;
const getPedido = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const pedido = await prisma_service_1.default.pedido.findFirst({
            where: {
                id: parseInt(id),
                userId,
            },
            include: {
                items: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }
        // Convert Decimal to number for JSON serialization
        const pedidoFormatted = {
            ...pedido,
            total: Number(pedido.total),
            items: pedido.items.map(item => ({
                ...item,
                precioUnitario: Number(item.precioUnitario),
                subtotal: Number(item.subtotal),
                producto: {
                    ...item.producto,
                    precio: Number(item.producto.precio)
                }
            }))
        };
        res.json(pedidoFormatted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el pedido" });
    }
};
exports.getPedido = getPedido;
