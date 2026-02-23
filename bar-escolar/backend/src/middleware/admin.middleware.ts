import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // El usuario ya está autenticado por authMiddleware
        // Verificar si es admin
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        // Check both 'role' and 'rol' for compatibility
        const userRole = user.role || user.rol;

        if (userRole !== 'ADMIN_BAR') {
            console.log('Access denied for user:', user);
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
        }

        next();
    } catch (error) {
        console.error('Error en admin middleware:', error);
        res.status(500).json({ message: 'Error en la autenticación de admin' });
    }
};
