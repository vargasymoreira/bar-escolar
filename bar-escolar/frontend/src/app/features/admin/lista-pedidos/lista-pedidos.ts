import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ClipboardList,
  Filter,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  ShoppingBag,
  DollarSign,
  Eye,
  FileX,
  ChefHat,
  PackageCheck,
} from 'lucide-angular';
import { AdminService } from '../../../core/services/admin';
import { Pedido, EstadoPedido } from '../../../shared/models/models';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './lista-pedidos.html',
  styleUrl: './lista-pedidos.css',
})
export class ListaPedidos implements OnInit {
  // Icons
  readonly ClipboardList = ClipboardList;
  readonly Filter = Filter;
  readonly List = List;
  readonly Clock = Clock;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly ShoppingBag = ShoppingBag;
  readonly DollarSign = DollarSign;
  readonly Eye = Eye;
  readonly FileX = FileX;
  readonly ChefHat = ChefHat;
  readonly PackageCheck = PackageCheck;

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  loading: boolean = true;
  filtroEstado: string = 'PENDIENTE';

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.adminService.getAllPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos.sort(
          (a, b) =>
            new Date(b.fechaPedido).getTime() -
            new Date(a.fechaPedido).getTime()
        );
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.loading = false;
      },
    });
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'TODOS') {
      this.pedidosFiltrados = this.pedidos;
    } else {
      this.pedidosFiltrados = this.pedidos.filter(
        (p) => p.estado === this.filtroEstado
      );
    }
  }

  contarPorEstado(estado: string): number {
    if (estado === 'TODOS') {
      return this.pedidos.length;
    }
    return this.pedidos.filter((p) => p.estado === estado).length;
  }

  cambiarEstado(pedidoId: number, nuevoEstado: EstadoPedido): void {
    this.adminService.updateEstadoPedido(pedidoId, nuevoEstado).subscribe({
      next: () => {
        this.loadPedidos();
      },
      error: (err) => {
        alert('Error al actualizar estado');
        console.error(err);
      },
    });
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      PENDIENTE: 'estado-pendiente',
      EN_PREPARACION: 'estado-preparacion',
      LISTO: 'estado-listo',
      ENTREGADO: 'estado-entregado',
      CANCELADO: 'estado-cancelado',
    };
    return classes[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      PENDIENTE: 'Pendiente',
      EN_PREPARACION: 'En Preparación',
      LISTO: 'Listo',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return textos[estado] || estado;
  }

  getEstadoIcon(estado: string): any {
    const iconos: { [key: string]: any } = {
      PENDIENTE: this.Clock,
      EN_PREPARACION: this.ChefHat,
      LISTO: this.CheckCircle2,
      ENTREGADO: this.PackageCheck,
      CANCELADO: this.XCircle,
    };
    return iconos[estado] || this.Clock;
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  verDetalle(pedidoId: number): void {
    this.router.navigate(['/admin/pedidos', pedidoId]);
  }
}
