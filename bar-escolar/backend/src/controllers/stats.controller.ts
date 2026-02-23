import { Request, Response } from 'express';
import prisma from '../services/prisma.service';

export class StatsController {
    // Ventas por día (últimos 7 días por defecto)
    static async getSalesByDay(req: Request, res: Response) {
        try {
            const { days = '7' } = req.query;
            const daysNum = parseInt(days as string);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysNum);

            const pedidos = await prisma.pedido.findMany({
                where: {
                    fechaPedido: {
                        gte: startDate
                    }
                },
                include: {
                    items: {
                        include: {
                            producto: true
                        }
                    }
                }
            });

            // Agrupar por día
            const salesByDay: { [key: string]: { date: string; sales: number; revenue: number; orders: number } } = {};

            for (let i = 0; i < daysNum; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                salesByDay[dateStr] = {
                    date: dateStr,
                    sales: 0,
                    revenue: 0,
                    orders: 0
                };
            }

            pedidos.forEach(pedido => {
                const dateStr = pedido.fechaPedido.toISOString().split('T')[0];
                if (salesByDay[dateStr]) {
                    salesByDay[dateStr].orders += 1;
                    const total = pedido.items.reduce((sum, item) =>
                        sum + (Number(item.producto.precio) * item.cantidad), 0
                    );
                    salesByDay[dateStr].revenue += total;
                    salesByDay[dateStr].sales += pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
                }
            });

            const result = Object.values(salesByDay).reverse();

            res.json(result);
        } catch (error) {
            console.error('Error getting sales by day:', error);
            res.status(500).json({ message: 'Error al obtener ventas por día' });
        }
    }

    // Productos más vendidos
    static async getBestSelling(req: Request, res: Response) {
        try {
            const { limit = '10' } = req.query;

            const items = await prisma.pedidoItem.groupBy({
                by: ['productoId'],
                _sum: {
                    cantidad: true
                },
                orderBy: {
                    _sum: {
                        cantidad: 'desc'
                    }
                },
                take: parseInt(limit as string)
            });

            const productsWithDetails = await Promise.all(
                items.map(async (item) => {
                    const producto = await prisma.producto.findUnique({
                        where: { id: item.productoId }
                    });
                    return {
                        producto,
                        totalSold: item._sum.cantidad || 0,
                        revenue: (item._sum.cantidad || 0) * Number(producto?.precio || 0)
                    };
                })
            );

            res.json(productsWithDetails);
        } catch (error) {
            console.error('Error getting best selling products:', error);
            res.status(500).json({ message: 'Error al obtener productos más vendidos' });
        }
    }

    // Estadísticas de ingresos
    static async getRevenue(req: Request, res: Response) {
        try {
            const { period = 'month' } = req.query;

            let startDate = new Date();
            if (period === 'week') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (period === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else if (period === 'year') {
                startDate.setFullYear(startDate.getFullYear() - 1);
            }

            const pedidos = await prisma.pedido.findMany({
                where: {
                    fechaPedido: {
                        gte: startDate
                    }
                },
                include: {
                    items: {
                        include: {
                            producto: true
                        }
                    }
                }
            });

            const totalRevenue = pedidos.reduce((sum, pedido) => {
                const pedidoTotal = pedido.items.reduce((itemSum, item) =>
                    itemSum + (Number(item.producto.precio) * item.cantidad), 0
                );
                return sum + pedidoTotal;
            }, 0);

            const totalOrders = pedidos.length;
            const totalItems = pedidos.reduce((sum, pedido) =>
                sum + pedido.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0
            );

            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            res.json({
                totalRevenue,
                totalOrders,
                totalItems,
                averageOrderValue,
                period
            });
        } catch (error) {
            console.error('Error getting revenue stats:', error);
            res.status(500).json({ message: 'Error al obtener estadísticas de ingresos' });
        }
    }

    // Horas pico (análisis por hora del día)
    static async getPeakHours(req: Request, res: Response) {
        try {
            const pedidos = await prisma.pedido.findMany({
                select: {
                    fechaPedido: true
                }
            });

            const hourCounts: { [key: number]: number } = {};
            for (let i = 0; i < 24; i++) {
                hourCounts[i] = 0;
            }

            pedidos.forEach(pedido => {
                const hour = pedido.fechaPedido.getHours();
                hourCounts[hour]++;
            });

            const result = Object.entries(hourCounts).map(([hour, count]) => ({
                hour: parseInt(hour),
                orders: count
            }));

            res.json(result);
        } catch (error) {
            console.error('Error getting peak hours:', error);
            res.status(500).json({ message: 'Error al obtener horas pico' });
        }
    }

    // Ventas por categoría
    static async getSalesByCategory(req: Request, res: Response) {
        try {
            const items = await prisma.pedidoItem.findMany({
                include: {
                    producto: true
                }
            });

            const categoryStats: { [key: string]: { sales: number; revenue: number } } = {};

            items.forEach(item => {
                const category = item.producto.categoria || 'Sin categoría';
                if (!categoryStats[category]) {
                    categoryStats[category] = { sales: 0, revenue: 0 };
                }
                categoryStats[category].sales += item.cantidad;
                categoryStats[category].revenue += Number(item.producto.precio) * item.cantidad;
            });

            const result = Object.entries(categoryStats).map(([category, stats]) => ({
                category,
                sales: stats.sales,
                revenue: stats.revenue
            }));

            res.json(result);
        } catch (error) {
            console.error('Error getting sales by category:', error);
            res.status(500).json({ message: 'Error al obtener ventas por categoría' });
        }
    }

    // Resumen general del dashboard
    static async getDashboardSummary(req: Request, res: Response) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [
                totalPedidos,
                pedidosHoy,
                totalProductos,
                totalIngresos
            ] = await Promise.all([
                prisma.pedido.count(),
                prisma.pedido.count({
                    where: {
                        fechaPedido: {
                            gte: today
                        }
                    }
                }),
                prisma.producto.count({
                    where: {
                        disponible: true
                    }
                }),
                prisma.pedido.findMany({
                    include: {
                        items: {
                            include: {
                                producto: true
                            }
                        }
                    }
                })
            ]);

            const ingresos = totalIngresos.reduce((sum, pedido) => {
                const pedidoTotal = pedido.items.reduce((itemSum, item) =>
                    itemSum + (Number(item.producto.precio) * item.cantidad), 0
                );
                return sum + pedidoTotal;
            }, 0);

            res.json({
                totalPedidos,
                pedidosHoy,
                totalProductos,
                totalIngresos: ingresos
            });
        } catch (error) {
            console.error('Error getting dashboard summary:', error);
            res.status(500).json({ message: 'Error al obtener resumen del dashboard' });
        }
    }
}
