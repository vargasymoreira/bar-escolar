import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Package,
  ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Type,
  FileText,
  Image,
  Save,
  X,
  PackageX,
  Search,
  Filter,
  Layers,
} from 'lucide-angular';
import { MenuService } from '../../../core/services/menu';
import { AdminService } from '../../../core/services/admin';
import { Producto } from '../../../shared/models/models';
import { ImageUploadComponent } from '../../../shared/image-upload/image-upload';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-gestion-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ImageUploadComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './gestion-menu.html',
  styleUrl: './gestion-menu.css',
})
export class GestionMenu implements OnInit {
  // Icons
  readonly Package = Package;
  readonly Plus = Plus;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly Tag = Tag;
  readonly DollarSign = DollarSign;
  readonly Type = Type;
  readonly FileText = FileText;
  readonly ImageIcon = ImageIcon;
  readonly Save = Save;
  readonly X = X;
  readonly PackageX = PackageX;
  readonly Search = Search;
  readonly Filter = Filter;
  readonly Layers = Layers;

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  loading: boolean = true;
  showForm: boolean = false;
  isEditing: boolean = false;

  // Filters
  searchTerm: string = '';
  selectedCategory: string = 'TODAS';
  selectedDisponibilidad: string = 'TODAS';

  productoForm: Partial<Producto> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    imagenUrl: '',
    disponible: true,
    variantes: [],
  };

  newVariante: { nombre: string; precio: number } = { nombre: '', precio: 0 };

  // Confirm dialog state
  showConfirmDialog = false;
  confirmDialogMessage = '';
  pendingAction: (() => void) | null = null;

  constructor(
    private menuService: MenuService,
    private adminService: AdminService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.loading = true;
    this.menuService.getMenu().subscribe({
      next: (productos) => {
        this.productos = productos;

        // Extract unique categories
        const categoriasSet = new Set<string>();
        this.productos.forEach(p => {
          if (p.categoria) {
            categoriasSet.add(p.categoria);
          }
        });
        this.categorias = Array.from(categoriasSet).sort();

        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.toastService.error('Error al cargar productos');
        this.loading = false;
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
        (p.descripcion && p.descripcion.toLowerCase().includes(search)) ||
        (p.categoria && p.categoria.toLowerCase().includes(search))
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'TODAS') {
      filtered = filtered.filter(p => p.categoria === this.selectedCategory);
    }

    // Filter by availability
    if (this.selectedDisponibilidad === 'DISPONIBLE') {
      filtered = filtered.filter(p => p.disponible);
    } else if (this.selectedDisponibilidad === 'NO_DISPONIBLE') {
      filtered = filtered.filter(p => !p.disponible);
    }

    this.productosFiltrados = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onDisponibilidadChange(): void {
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

  contarDisponibles(): number {
    return this.productos.filter((p) => p.disponible).length;
  }

  openForm(producto?: Producto): void {
    if (producto) {
      this.isEditing = true;
      this.productoForm = { ...producto, variantes: producto.variantes || [] };
    } else {
      this.isEditing = false;
      this.resetForm();
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      imagenUrl: '',
      disponible: true,
      variantes: [],
    };
    this.newVariante = { nombre: '', precio: 0 };
  }

  addVariante(): void {
    if (!this.newVariante.nombre || !this.newVariante.precio) {
      this.toastService.warning('Nombre y precio de variante requeridos');
      return;
    }

    if (!this.productoForm.variantes) {
      this.productoForm.variantes = [];
    }

    // Cast to any to avoid ID requirement for new variants
    (this.productoForm.variantes as any[]).push({ ...this.newVariante });
    this.newVariante = { nombre: '', precio: 0 };
  }

  removeVariante(index: number): void {
    if (this.productoForm.variantes) {
      this.productoForm.variantes.splice(index, 1);
    }
  }

  saveProducto(): void {
    if (!this.productoForm.nombre || !this.productoForm.precio) {
      this.toastService.warning('Nombre y precio son obligatorios');
      return;
    }

    if (this.isEditing && this.productoForm.id) {
      this.adminService
        .updateProducto(this.productoForm.id, this.productoForm)
        .subscribe({
          next: () => {
            this.toastService.success('Producto actualizado exitosamente');
            this.loadProductos();
            this.closeForm();
          },
          error: (err) => {
            this.toastService.error('Error al actualizar producto');
            console.error(err);
          },
        });
    } else {
      this.adminService.createProducto(this.productoForm).subscribe({
        next: () => {
          this.toastService.success('Producto creado exitosamente');
          this.loadProductos();
          this.closeForm();
        },
        error: (err) => {
          this.toastService.error('Error al crear producto');
          console.error(err);
        },
      });
    }
  }

  deleteProducto(id: number): void {
    this.confirmDialogMessage =
      '¿Eliminar este producto? Esta acción no se puede deshacer.';
    this.pendingAction = () => {
      this.adminService.deleteProducto(id).subscribe({
        next: () => {
          this.toastService.success('Producto eliminado exitosamente');
          this.loadProductos();
        },
        error: (err) => {
          this.toastService.error('Error al eliminar producto');
          console.error(err);
        },
      });
    };
    this.showConfirmDialog = true;
  }

  onConfirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmDialog = false;
  }

  onCancelAction(): void {
    this.pendingAction = null;
    this.showConfirmDialog = false;
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    if (imagePath.startsWith('http')) return imagePath;
    // Construct full URL for uploaded images
    return `http://localhost:3000${imagePath}`;
  }

  onImageUploaded(imageUrl: string): void {
    this.productoForm.imagenUrl = imageUrl;
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
