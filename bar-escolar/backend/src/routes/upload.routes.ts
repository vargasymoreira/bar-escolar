import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload, handleMulterError } from '../middleware/upload.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Rutas protegidas - requieren autenticación
router.post(
    '/product',
    authMiddleware,
    upload.single('image'),
    handleMulterError,
    UploadController.uploadProductImage
);

router.post(
    '/avatar',
    authMiddleware,
    upload.single('avatar'),
    handleMulterError,
    UploadController.uploadAvatar
);

export default router;
