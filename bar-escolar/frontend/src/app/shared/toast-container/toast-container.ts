import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-angular';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './toast-container.html',
    styleUrl: './toast-container.css',
})
export class ToastContainerComponent implements OnInit {
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly AlertTriangle = AlertTriangle;
    readonly Info = Info;
    readonly X = X;

    toasts: Toast[] = [];

    constructor(private toastService: ToastService) { }

    ngOnInit(): void {
        this.toastService.toasts$.subscribe(toasts => {
            this.toasts = toasts;
        });
    }

    getIcon(type: Toast['type']) {
        switch (type) {
            case 'success':
                return this.CheckCircle;
            case 'error':
                return this.XCircle;
            case 'warning':
                return this.AlertTriangle;
            case 'info':
                return this.Info;
            default:
                return this.Info;
        }
    }

    removeToast(id: string): void {
        this.toastService.remove(id);
    }
}
