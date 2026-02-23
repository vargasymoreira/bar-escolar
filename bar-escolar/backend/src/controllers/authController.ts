import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../services/prisma.service";
import { generateToken } from "../config/jwt";
import { RegisterDto, LoginDto, AuthRequest } from "../types";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, cedula }: RegisterDto = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !cedula) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { cedula }],
      },
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }
      return res.status(400).json({ message: "La cédula ya está registrada" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        cedula,
        role: "ESTUDIANTE",
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        cedula: true,
        imagenUrl: true,
        role: true,
      },
    });

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDto = req.body;

    // Validar campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios" });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        cedula: user.cedula,
        imagenUrl: user.imagenUrl,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        cedula: true,
        imagenUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { nombre, imagenUrl, password } = req.body;

    const data: any = {};
    if (nombre) data.nombre = nombre;
    if (imagenUrl) data.imagenUrl = imagenUrl;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        nombre: true,
        cedula: true,
        role: true,
        imagenUrl: true,
      },
    });

    res.json({
      message: "Perfil actualizado exitosamente",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};
