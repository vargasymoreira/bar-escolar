import { Request, Response } from "express";
import prisma from "../services/prisma.service";

export const getMenu = async (req: Request, res: Response) => {
  try {
    const { categoria } = req.query;

    const productos = await prisma.producto.findMany({
      where: {
        disponible: true,
        ...(categoria && { categoria: categoria as string }),
      },
      orderBy: {
        categoria: "asc",
      },
      include: {
        variantes: true,
      },
    });

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el menú" });
  }
};

export const getProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        variantes: true,
      },
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el producto" });
  }
};
