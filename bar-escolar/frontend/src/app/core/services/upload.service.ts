import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    /**
     * Sube una imagen de producto
     */
    uploadProductImage(file: File): Observable<{ imageUrl: string; progress?: number }> {
        const formData = new FormData();
        formData.append('image', file);

        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload/product`, formData, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<any>) => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
                        return { imageUrl: '', progress };
                    case HttpEventType.Response:
                        return { imageUrl: event.body.imageUrl, progress: 100 };
                    default:
                        return { imageUrl: '', progress: 0 };
                }
            })
        );
    }

    /**
     * Sube un avatar de usuario
     */
    uploadAvatar(file: File): Observable<{ avatarUrl: string; progress?: number }> {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/upload/avatar`, formData, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<any>) => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
                        return { avatarUrl: '', progress };
                    case HttpEventType.Response:
                        return { avatarUrl: event.body.avatarUrl, progress: 100 };
                    default:
                        return { avatarUrl: '', progress: 0 };
                }
            })
        );
    }

    /**
     * Valida el archivo antes de subirlo
     */
    validateFile(file: File): { valid: boolean; error?: string } {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'El archivo es demasiado grande. Máximo 5MB'
            };
        }

        return { valid: true };
    }

    /**
     * Obtiene la URL completa de una imagen
     */
    getImageUrl(imagePath: string): string {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = environment.apiUrl?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${imagePath}`;
    }
}
