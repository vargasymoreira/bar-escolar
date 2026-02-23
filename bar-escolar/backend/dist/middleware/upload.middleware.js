"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Crear directorio de uploads si no existe
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configuración de almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre único y limpio
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        // Sanitize filename: remove spaces, special chars, keep only alphanumeric and dashes
        const nameWithoutExt = path_1.default.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
        cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    }
});
// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'));
    }
};
// Configuración de multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    }
});
// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB' });
        }
        return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
    }
    else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
exports.handleMulterError = handleMulterError;
