import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './modal.html',
    styleUrl: './modal.css',
})
export class ModalComponent implements OnInit, OnDestroy {
    @Input() title: string = '';
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Input() showCloseButton: boolean = true;
    @Output() close = new EventEmitter<void>();

    readonly X = X;

    ngOnInit(): void {
        // Add ESC key listener
        document.addEventListener('keydown', this.handleEscKey);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    ngOnDestroy(): void {
        // Remove ESC key listener
        document.removeEventListener('keydown', this.handleEscKey);
        // Restore body scroll
        document.body.style.overflow = '';
    }

    handleEscKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.onClose();
        }
    };

    onClose(): void {
        this.close.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        // Only close if clicking directly on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            this.onClose();
        }
    }
}
