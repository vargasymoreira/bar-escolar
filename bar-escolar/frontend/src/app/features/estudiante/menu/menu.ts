import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShoppingCart, Plus, Minus, Search, Filter } from 'lucide-angular';
import { MenuService } from '../../../core/services/menu';
import { CarritoService } from '../../../core/services/carrito.service';
import { Producto } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  // Icons
  readonly ShoppingCart = ShoppingCart;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Search = Search;
  readonly Filter = Filter;

  // Data
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  loading: boolean = true;
  error: string = '';
  selectedQuantities: { [key: number]: number } = {};
  selectedVariantes: { [key: number]: any } = {};
  cartItemCount: number = 0;

  // Filters
  searchTerm: string = '';
  selectedCategory: string = 'TODAS';

  constructor(
    private menuService: MenuService,
    private carritoService: CarritoService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadProductos();
    // Subscribe to cart changes to update badge
    this.carritoService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.cantidad, 0);
    });
  }

  loadProductos(): void {
    this.loading = true;
    this.menuService.getMenu().subscribe({
      next: (productos) => {
        // Only show available products
        this.productos = productos.filter(p => p.disponible);

        // Extract unique categories
        const categoriasSet = new Set<string>();
        this.productos.forEach(p => {
          if (p.categoria) {
            categoriasSet.add(p.categoria);
          }
        });
        this.categorias = Array.from(categoriasSet).sort();

        // Initialize quantities and default variants
        this.productos.forEach((p) => {
          this.selectedQuantities[p.id] = 1;
          if (p.variantes && p.variantes.length > 0) {
            this.selectedVariantes[p.id] = p.variantes[0];
          }
        });

        // Apply initial filter
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el menú';
        this.loading = false;
        console.error(err);
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.productos];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(search))
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'TODAS') {
      filtered = filtered.filter(p => p.categoria === this.selectedCategory);
    }

    this.productosFiltrados = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  getProductosPorCategoria(): { categoria: string, productos: Producto[] }[] {
    if (this.selectedCategory !== 'TODAS') {
      return [{
        categoria: this.selectedCategory,
        productos: this.productosFiltrados
      }];
    }

    const groups: { [key: string]: Producto[] } = {};

    this.productosFiltrados.forEach(producto => {
      const cat = producto.categoria || 'Sin Categoría';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(producto);
    });

    return Object.keys(groups).sort().map(categoria => ({
      categoria,
      productos: groups[categoria]
    }));
  }

  addToCart(producto: Producto): void {
    const cantidad = this.selectedQuantities[producto.id] || 1;
    const variante = this.selectedVariantes[producto.id];

    if (producto.variantes && producto.variantes.length > 0 && !variante) {
      this.toastService.warning('Selecciona una opción');
      return;
    }

    this.carritoService.addToCart(producto, cantidad, variante);
    // Reset quantity to 1
    this.selectedQuantities[producto.id] = 1;
    this.toastService.success(`${producto.nombre} agregado al carrito!`);
  }

  onVarianteChange(productoId: number, variante: any): void {
    this.selectedVariantes[productoId] = variante;
  }

  incrementQuantity(productoId: number): void {
    this.selectedQuantities[productoId] =
      (this.selectedQuantities[productoId] || 1) + 1;
  }

  decrementQuantity(productoId: number): void {
    if (this.selectedQuantities[productoId] > 1) {
      this.selectedQuantities[productoId]--;
    }
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    if (imagePath.startsWith('http')) return imagePath;
    // Construct full URL for uploaded images
    return `http://localhost:3000${imagePath}`;
  }
}
