import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido';
import { AdminService } from '../../../core/services/admin';
import { Pedido, EstadoPedido } from '../../../shared/models/models';

@Component({
  selector: 'app-detalle-pedido-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-pedido-admin.html',
  styleUrl: './detalle-pedido-admin.css',
})
export class DetallePedidoAdmin implements OnInit {
  pedido: Pedido | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPedido(parseInt(id));
    } else {
      this.error = 'ID de pedido inválido';
      this.loading = false;
    }
  }

  loadPedido(id: number): void {
    this.loading = true;
    this.adminService.getPedido(id).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el pedido';
        this.loading = false;
        console.error(err);
      },
    });
  }

  cambiarEstado(nuevoEstado: EstadoPedido): void {
    if (!this.pedido) return;

    this.adminService
      .updateEstadoPedido(this.pedido.id, nuevoEstado)
      .subscribe({
        next: () => {
          if (this.pedido) {
            this.pedido.estado = nuevoEstado;
          }
          alert('Estado actualizado');
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

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  volver(): void {
    this.router.navigate(['/admin/pedidos']);
  }
}
