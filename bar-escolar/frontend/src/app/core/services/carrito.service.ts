import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CarritoItem, Producto } from '../../shared/models/models';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root',
})
export class CarritoService {
    private readonly BASE_STORAGE_KEY = 'bar-escolar-carrito';
    private cartItemsSubject = new BehaviorSubject<CarritoItem[]>([]);
    public cartItems$ = this.cartItemsSubject.asObservable();

    constructor(private authService: AuthService) {
        // Suscribirse a cambios de usuario para cargar el carrito correcto
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.cartItemsSubject.next(this.loadFromStorage(user.id.toString()));
            } else {
                this.cartItemsSubject.next([]);
            }
        });
    }

    private getStorageKey(userId: string): string {
        return `${this.BASE_STORAGE_KEY}-${userId}`;
    }

    private loadFromStorage(userId: string): CarritoItem[] {
        const stored = localStorage.getItem(this.getStorageKey(userId));
        return stored ? JSON.parse(stored) : [];
    }

    private saveToStorage(items: CarritoItem[]): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            localStorage.setItem(this.getStorageKey(user.id.toString()), JSON.stringify(items));
        }
        this.cartItemsSubject.next(items);
    }

    getCartItems(): CarritoItem[] {
        return this.cartItemsSubject.value;
    }

    addToCart(producto: Producto, cantidad: number = 1, variante?: any): void {
        const currentItems = this.getCartItems();

        // Find if item exists (same product AND same variant)
        const existingItem = currentItems.find((item) => {
            if (item.producto.id !== producto.id) return false;

            // If new item has variant
            if (variante) {
                return item.variante?.id === variante.id;
            }

            // If new item has NO variant, look for item with NO variant
            return !item.variante;
        });

        if (existingItem) {
            existingItem.cantidad += cantidad;
        } else {
            currentItems.push({ producto, cantidad, variante });
        }

        this.saveToStorage(currentItems);
    }

    updateQuantity(productoId: number, cantidad: number, varianteId?: number): void {
        const currentItems = this.getCartItems();
        const item = currentItems.find((i) => {
            if (i.producto.id !== productoId) return false;
            if (varianteId) return i.variante?.id === varianteId;
            return !i.variante;
        });

        if (item) {
            if (cantidad <= 0) {
                this.removeFromCart(productoId, varianteId);
            } else {
                item.cantidad = cantidad;
                this.saveToStorage(currentItems);
            }
        }
    }

    removeFromCart(productoId: number, varianteId?: number): void {
        const currentItems = this.getCartItems().filter((item) => {
            if (item.producto.id !== productoId) return true;
            if (varianteId) return item.variante?.id !== varianteId;
            return !!item.variante; // Keep if it has variant but we are removing base product (or vice versa logic?)
            // Logic: Remove if ProductID matches AND (VarianteID matches OR both are null)
        });

        // Correct Filter Logic:
        // Keep item if:
        // 1. Product ID is different
        // OR
        // 2. Product ID matches BUT variant doesn't match

        const newItems = this.getCartItems().filter(item => {
            if (item.producto.id !== productoId) return true;
            if (varianteId) {
                // We want to remove specific variant. Keep if variant ID is different or null
                return item.variante?.id !== varianteId;
            } else {
                // We want to remove access product (no variant). Keep if it HAS a variant
                return !!item.variante;
            }
        });

        this.saveToStorage(newItems);
    }

    clearCart(): void {
        this.saveToStorage([]);
    }

    getTotal(): number {
        return this.getCartItems().reduce((total, item) => {
            const precio = item.variante ? Number(item.variante.precio) : Number(item.producto.precio);
            return total + precio * item.cantidad;
        }, 0);
    }

    getItemCount(): number {
        return this.getCartItems().reduce(
            (count, item) => count + item.cantidad,
            0
        );
    }
}
