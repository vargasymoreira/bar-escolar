"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
const jwt_1 = require("../config/jwt");
const register = async (req, res) => {
    try {
        const { email, password, nombre, cedula } = req.body;
        // Validar campos requeridos
        if (!email || !password || !nombre || !cedula) {
            return res
                .status(400)
                .json({ message: "Todos los campos son obligatorios" });
        }
        // Verificar si el usuario ya existe
        const existingUser = await prisma_service_1.default.user.findFirst({
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Crear usuario
        const user = await prisma_service_1.default.user.create({
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
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            message: "Usuario registrado exitosamente",
            token,
            user,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar usuario" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validar campos
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email y contraseña son obligatorios" });
        }
        // Buscar usuario
        const user = await prisma_service_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }
        // Verificar contraseña
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }
        // Generar token
        const token = (0, jwt_1.generateToken)({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await prisma_service_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener perfil" });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { nombre, imagenUrl, password } = req.body;
        const data = {};
        if (nombre)
            data.nombre = nombre;
        if (imagenUrl)
            data.imagenUrl = imagenUrl;
        if (password) {
            data.password = await bcrypt_1.default.hash(password, 10);
        }
        const user = await prisma_service_1.default.user.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar perfil" });
    }
};
exports.updateProfile = updateProfile;
