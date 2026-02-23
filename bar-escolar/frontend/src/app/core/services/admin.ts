import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoPedido, Pedido, Producto } from '../../shared/models/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  // Gestión de Pedidos
  getAllPedidos(estado?: EstadoPedido): Observable<Pedido[]> {
    const url = estado
      ? `${this.apiUrl}/pedidos?estado=${estado}`
      : `${this.apiUrl}/pedidos`;
    return this.http.get<Pedido[]>(url);
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }

  updateEstadoPedido(
    id: number,
    estado: EstadoPedido
  ): Observable<{ message: string; pedido: Pedido }> {
    return this.http.patch<{ message: string; pedido: Pedido }>(
      `${this.apiUrl}/pedidos/${id}`,
      { estado }
    );
  }

  // Gestión de Productos
  createProducto(
    data: Partial<Producto>
  ): Observable<{ message: string; producto: Producto }> {
    return this.http.post<{ message: string; producto: Producto }>(
      `${this.apiUrl}/productos`,
      data
    );
  }

  updateProducto(
    id: number,
    data: Partial<Producto>
  ): Observable<{ message: string; producto: Producto }> {
    return this.http.put<{ message: string; producto: Producto }>(
      `${this.apiUrl}/productos/${id}`,
      data
    );
  }

  deleteProducto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/productos/${id}`
    );
  }
}
