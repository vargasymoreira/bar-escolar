import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-angular';
import {
  StatsService,
  DashboardSummary,
} from '../../../core/services/stats.service';
import { AdminService } from '../../../core/services/admin';
import { AuthService } from '../../../core/services/auth';
import { Pedido, EstadoPedido } from '../../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  // Icons
  readonly TrendingUp = TrendingUp;
  readonly DollarSign = DollarSign;
  readonly Package = Package;
  readonly ShoppingCart = ShoppingCart;
  readonly BarChart3 = BarChart3;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;

  private refreshInterval?: any;

  // Data
  adminName: string = '';
  loading: boolean = true;
  loadingPedidos: boolean = false;

  summary: DashboardSummary = {
    totalPedidos: 0,
    pedidosHoy: 0,
    totalProductos: 0,
    totalIngresos: 0,
  };

  // Pedidos activos
  pedidosPendientes: Pedido[] = [];
  pedidosEnPreparacion: Pedido[] = [];

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.nombre || 'Admin';
    this.loadSummary();
    this.loadPedidosActivos();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  setupAutoRefresh(): void {
    // Auto-actualizar pedidos cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.loadPedidosActivos();
    }, 30000);
  }

  loadSummary(): void {
    this.loading = true;
    this.statsService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading summary:', err);
        this.loading = false;
      },
    });
  }

  loadPedidosActivos(): void {
    this.loadingPedidos = true;

    this.adminService.getAllPedidos().subscribe({
      next: (pedidos) => {
        this.pedidosPendientes = pedidos.filter(
          (p) => p.estado === 'PENDIENTE'
        );
        this.pedidosEnPreparacion = pedidos.filter(
          (p) => p.estado === 'EN_PREPARACION'
        );

        this.loadingPedidos = false;
      },
      error: (err) => {
        console.error('Error loading pedidos activos:', err);
        this.loadingPedidos = false;
      },
    });
  }

  marcarComoEnPreparacion(pedidoId: number): void {
    const pedido = this.pedidosPendientes.find((p) => p.id === pedidoId);
    if (pedido) {
      this.adminService
        .updateEstadoPedido(pedidoId, 'EN_PREPARACION')
        .subscribe({
          next: () => {
            pedido.estado = 'EN_PREPARACION';
            this.pedidosPendientes = this.pedidosPendientes.filter(
              (p) => p.id !== pedidoId
            );
            this.pedidosEnPreparacion.push(pedido);
          },
          error: (err) => console.error('Error actualizando estado:', err),
        });
    }
  }

  marcarComoListo(pedidoId: number): void {
    const pedido = this.pedidosEnPreparacion.find((p) => p.id === pedidoId);
    if (pedido) {
      this.adminService.updateEstadoPedido(pedidoId, 'LISTO').subscribe({
        next: () => {
          pedido.estado = 'LISTO';
          this.pedidosEnPreparacion = this.pedidosEnPreparacion.filter(
            (p) => p.id !== pedidoId
          );
          this.loadPedidosActivos();
        },
        error: (err) => console.error('Error actualizando estado:', err),
      });
    }
  }

  getEstadoBadgeClass(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'EN_PREPARACION':
        return 'badge-preparacion';
      case 'LISTO':
        return 'badge-listo';
      case 'ENTREGADO':
        return 'badge-entregado';
      case 'CANCELADO':
        return 'badge-cancelado';
      default:
        return 'badge-default';
    }
  }

  getEstadoTexto(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_PREPARACION':
        return 'En Preparación';
      case 'LISTO':
        return 'Listo';
      case 'ENTREGADO':
        return 'Entregado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  getHoraFormateada(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
