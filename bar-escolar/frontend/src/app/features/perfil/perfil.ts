import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Mail, Lock, Camera, Save, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast.service';
import { UploadService } from '../../core/services/upload.service';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload';
import { User as UserInterface } from '../../shared/models/models';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ImageUploadComponent],
    templateUrl: './perfil.html',
    styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit {
    // Icons
    readonly UserIcon = User;
    readonly Mail = Mail;
    readonly Lock = Lock;
    readonly Camera = Camera;
    readonly Save = Save;
    readonly ArrowLeft = ArrowLeft;

    currentUser: UserInterface | null = null;
    nombre = '';
    email = '';
    cedula = '';
    password = '';
    confirmPassword = '';
    imagenUrl = '';

    loading = false;

    constructor(
        private authService: AuthService,
        private toastService: ToastService,
        private uploadService: UploadService
    ) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.nombre = user.nombre;
                this.email = user.email;
                this.cedula = user.cedula || '';
                this.imagenUrl = user.imagenUrl || '';
            }
        });
    }

    onImageUploaded(url: string): void {
        this.imagenUrl = url;
        // La vista previa se actualiza localmente, pero el currentUser del AuthService
        // solo cambiará cuando el usuario pulse "Guardar".
    }

    saveProfile(): void {
        if (!this.nombre.trim()) {
            this.toastService.error('El nombre es obligatorio');
            return;
        }

        if (this.password && this.password !== this.confirmPassword) {
            this.toastService.error('Las contraseñas no coinciden');
            return;
        }

        this.loading = true;
        const updateData: any = {
            nombre: this.nombre,
            imagenUrl: this.imagenUrl
        };

        if (this.password) {
            updateData.password = this.password;
        }

        this.authService.updateProfile(updateData).subscribe({
            next: () => {
                this.toastService.success('Perfil actualizado correctamente');
                this.password = '';
                this.confirmPassword = '';
                this.loading = false;
            },
            error: (error) => {
                this.toastService.error(error.error?.message || 'Error al actualizar el perfil');
                this.loading = false;
            }
        });
    }

    getImageUrl(path: string): string {
        return this.uploadService.getImageUrl(path);
    }
}
