import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { LucideAngularModule, ShoppingCart, User, LogOut, Menu, X, UtensilsCrossed, ClipboardList } from 'lucide-angular';
import { AuthService } from '../../core/services/auth';
import { CarritoService } from '../../core/services/carrito.service';
import { UploadService } from '../../core/services/upload.service';

@Component({
    selector: 'app-student-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterOutlet, LucideAngularModule],
    templateUrl: './student-layout.html',
    styleUrl: './student-layout.css',
})
export class StudentLayout implements OnInit {
    // Icons
    readonly ShoppingCart = ShoppingCart;
    readonly User = User;
    readonly LogOut = LogOut;
    readonly Menu = Menu;
    readonly X = X;
    readonly UtensilsCrossed = UtensilsCrossed;
    readonly ClipboardList = ClipboardList;

    // State
    showProfileDropdown = false;
    studentName = '';
    studentEmail = '';
    cartItemCount = 0;
    currentUser: any = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private carritoService: CarritoService,
        private uploadService: UploadService
    ) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.studentName = user?.nombre || 'Estudiante';
            this.studentEmail = user?.email || 'estudiante@barescolar.com';
        });

        // Subscribe to cart changes
        this.carritoService.cartItems$.subscribe(items => {
            this.cartItemCount = items.reduce((total, item) => total + item.cantidad, 0);
        });
    }

    toggleProfileDropdown(): void {
        this.showProfileDropdown = !this.showProfileDropdown;
    }

    logout(): void {
        // Cerrar dropdown
        this.showProfileDropdown = false;

        // Limpiar carrito
        this.carritoService.clearCart();

        // Hacer logout
        this.authService.logout();

        // Navegar a login
        this.router.navigate(['/login']);
    }

    getImageUrl(path: string): string {
        return this.uploadService.getImageUrl(path);
    }
}
