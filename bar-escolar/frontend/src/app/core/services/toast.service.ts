import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

    private defaultDuration = 3000; // 3 seconds

    show(type: Toast['type'], message: string, duration?: number): void {
        const id = this.generateId();
        const toast: Toast = {
            id,
            type,
            message,
            duration: duration || this.defaultDuration
        };

        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next([...currentToasts, toast]);

        // Auto-remove after duration
        setTimeout(() => {
            this.remove(id);
        }, toast.duration);
    }

    success(message: string, duration?: number): void {
        this.show('success', message, duration);
    }

    error(message: string, duration?: number): void {
        this.show('error', message, duration);
    }

    warning(message: string, duration?: number): void {
        this.show('warning', message, duration);
    }

    info(message: string, duration?: number): void {
        this.show('info', message, duration);
    }

    remove(id: string): void {
        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
    }

    clear(): void {
        this.toastsSubject.next([]);
    }

    private generateId(): string {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
