import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ClipboardList, UtensilsCrossed, ArrowLeft } from 'lucide-angular';
import { PedidoService } from '../../../core/services/pedido';
import { Pedido } from '../../../shared/models/models';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css',
})
export class MisPedidos implements OnInit {
  readonly ClipboardList = ClipboardList;
  readonly UtensilsCrossed = UtensilsCrossed;
  readonly ArrowLeft = ArrowLeft;

  pedidos: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private pedidoService: PedidoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading = true;
    this.pedidoService.getMisPedidos().subscribe({
      next: (pedidos) => {
        // Ordenar por fecha más reciente primero
        this.pedidos = pedidos.sort(
          (a, b) =>
            new Date(b.fechaPedido).getTime() -
            new Date(a.fechaPedido).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pedidos';
        this.loading = false;
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
    this.router.navigate(['/pedido', pedidoId]);
  }
}
