import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterOutlet,
  Router,
  RouterLinkActive,
} from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  BarChart3,
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    LucideAngularModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {
  // Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly Package = Package;
  readonly ShoppingCart = ShoppingCart;
  readonly Menu = Menu;
  readonly X = X;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly UtensilsCrossed = UtensilsCrossed;
  readonly BarChart3 = BarChart3;

  sidebarCollapsed = false;
  showProfileDropdown = false;
  adminName = '';
  adminEmail = '';
  currentUser: any = null;

  constructor(private authService: AuthService, private router: Router, private uploadService: UploadService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.adminName = user?.nombre || 'Admin';
      this.adminEmail = user?.email || 'admin@barescolar.com';
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getImageUrl(path: string): string {
    return this.uploadService.getImageUrl(path);
  }
}
