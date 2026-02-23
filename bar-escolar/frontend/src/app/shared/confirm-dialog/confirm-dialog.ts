import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, CheckCircle, X } from 'lucide-angular';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './confirm-dialog.html',
    styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
    @Input() title: string = '¿Estás seguro?';
    @Input() message: string = 'Esta acción no se puede deshacer.';
    @Input() confirmText: string = 'Confirmar';
    @Input() cancelText: string = 'Cancelar';
    @Input() type: 'warning' | 'danger' | 'info' = 'warning';
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    readonly AlertTriangle = AlertTriangle;
    readonly CheckCircle = CheckCircle;
    readonly X = X;

    onConfirm(): void {
        this.confirm.emit();
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }
}
