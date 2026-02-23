import { Request, Response } from 'express';
import path from 'path';

export class UploadController {
    // Subir imagen de producto
    static uploadProductImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
            }

            // Generar URL de la imagen
            const imageUrl = `/uploads/${req.file.filename}`;

            console.log('✅ Imagen subida:', {
                filename: req.file.filename,
                path: req.file.path,
                url: imageUrl
            });

            res.status(200).json({
                message: 'Imagen subida exitosamente',
                imageUrl: imageUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Error al subir imagen de producto:', error);
            res.status(500).json({ message: 'Error al subir la imagen' });
        }
    }

    // Subir avatar de usuario
    static uploadAvatar(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
            }

            // Generar URL del avatar
            const avatarUrl = `/uploads/${req.file.filename}`;

            res.status(200).json({
                message: 'Avatar subido exitosamente',
                avatarUrl: avatarUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Error al subir avatar:', error);
            res.status(500).json({ message: 'Error al subir el avatar' });
        }
    }
}
