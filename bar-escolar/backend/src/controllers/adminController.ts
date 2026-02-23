import { Request, Response } from "express";
import prisma from "../services/prisma.service";
import { CreateProductoDto } from "../types";

// GESTIÓN DE PEDIDOS
export const getAllPedidos = async (req: Request, res: Response) => {
  try {
    const { estado } = req.query;

    const pedidos = await prisma.pedido.findMany({
      where: estado ? { estado: estado as string } : {},
      include: {
        user: {
          select: {
            nombre: true,
            email: true,
          },
        },
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
    const pedidosFormatted = pedidos.map((pedido: any) => ({
      ...pedido,
      total: Number(pedido.total),
      items: pedido.items.map((item: any) => ({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
};

export const updateEstadoPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ message: "El estado es requerido" });
    }

    const pedido = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { estado },
      include: {
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    // Convert Decimal to number
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

    res.json({
      message: "Estado del pedido actualizado",
      pedido: pedidoFormatted,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al actualizar el estado del pedido" });
  }
};

export const getPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            nombre: true,
            email: true,
            cedula: true,
          },
        },
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el pedido" });
  }
};


// GESTIÓN DE PRODUCTOS
export const createProducto = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      imagenUrl,
      categoria,
      variantes,
    }: CreateProductoDto = req.body;

    if (!nombre || !precio || !categoria) {
      return res
        .status(400)
        .json({ message: "Nombre, precio y categoría son obligatorios" });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio,
        imagenUrl,
        categoria,
        variantes: {
          create: variantes?.map((v) => ({
            nombre: v.nombre,
            precio: v.precio,
          })),
        },
      },
      include: {
        variantes: true,
      },
    });

    res.status(201).json({
      message: "Producto creado exitosamente",
      producto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el producto" });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagenUrl, categoria, disponible, variantes } =
      req.body;

    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio && { precio }),
        ...(imagenUrl !== undefined && { imagenUrl }),
        ...(categoria && { categoria }),
        ...(disponible !== undefined && { disponible }),
        ...(variantes && {
          variantes: {
            deleteMany: {},
            create: variantes.map((v: any) => ({
              nombre: v.nombre,
              precio: v.precio,
            })),
          },
        }),
      },
      include: {
        variantes: true,
      },
    });

    res.json({
      message: "Producto actualizado exitosamente",
      producto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Instead of deleting, mark as unavailable (soft delete)
    // This prevents foreign key constraint errors
    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { disponible: false },
    });

    res.json({
      message: "Producto marcado como no disponible",
      producto: {
        ...producto,
        precio: Number(producto.precio)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
};
