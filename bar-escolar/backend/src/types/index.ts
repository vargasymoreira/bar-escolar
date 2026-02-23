import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
  cedula: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  categoria: string;
  variantes?: {
    nombre: string;
    precio: number;
  }[];
}

export interface CreatePedidoDto {
  items: {
    productoId: number;
    cantidad: number;
    varianteNombre?: string;
  }[];
  observaciones?: string;
}
