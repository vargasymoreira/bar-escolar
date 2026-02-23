import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Upload, X, Image as ImageIcon } from 'lucide-angular';
import { UploadService } from '../../core/services/upload.service';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './image-upload.html',
    styleUrl: './image-upload.css',
})
export class ImageUploadComponent implements OnInit, OnChanges {
    @Input() currentImageUrl?: string;
    @Input() uploadType: 'product' | 'avatar' = 'product';
    @Output() imageUploaded = new EventEmitter<string>();

    // Icons
    readonly Upload = Upload;
    readonly X = X;
    readonly ImageIcon = ImageIcon;

    // State
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    uploading = false;
    uploadProgress = 0;
    error: string | null = null;
    isDragging = false;

    constructor(private uploadService: UploadService) { }

    ngOnInit() {
        this.updatePreviewFromInput();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['currentImageUrl'] && !changes['currentImageUrl'].isFirstChange()) {
            this.updatePreviewFromInput();
        }
    }

    private updatePreviewFromInput() {
        if (this.currentImageUrl) {
            this.previewUrl = this.uploadService.getImageUrl(this.currentImageUrl);
        } else {
            this.previewUrl = null;
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.handleFile(input.files[0]);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
            this.handleFile(event.dataTransfer.files[0]);
        }
    }

    handleFile(file: File) {
        this.error = null;

        // Validar archivo
        const validation = this.uploadService.validateFile(file);
        if (!validation.valid) {
            this.error = validation.error || 'Archivo no válido';
            return;
        }

        this.selectedFile = file;

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    uploadImage() {
        if (!this.selectedFile) return;

        this.uploading = true;
        this.error = null;
        this.uploadProgress = 0;

        if (this.uploadType === 'product') {
            this.uploadService.uploadProductImage(this.selectedFile).subscribe({
                next: (result: { imageUrl: string; progress?: number }) => {
                    if (result.progress !== undefined) {
                        this.uploadProgress = result.progress;
                    }

                    if (result.imageUrl) {
                        this.imageUploaded.emit(result.imageUrl);
                        this.uploading = false;
                        this.selectedFile = null;
                    }
                },
                error: (err: any) => {
                    this.error = err.error?.message || 'Error al subir la imagen';
                    this.uploading = false;
                    this.uploadProgress = 0;
                }
            });
        } else {
            this.uploadService.uploadAvatar(this.selectedFile).subscribe({
                next: (result: { avatarUrl: string; progress?: number }) => {
                    if (result.progress !== undefined) {
                        this.uploadProgress = result.progress;
                    }

                    if (result.avatarUrl) {
                        this.imageUploaded.emit(result.avatarUrl);
                        this.uploading = false;
                        this.selectedFile = null;
                    }
                },
                error: (err: any) => {
                    this.error = err.error?.message || 'Error al subir la imagen';
                    this.uploading = false;
                    this.uploadProgress = 0;
                }
            });
        }
    }

    removeImage() {
        this.selectedFile = null;
        this.previewUrl = this.currentImageUrl ? this.uploadService.getImageUrl(this.currentImageUrl) : null;
        this.error = null;
        this.uploadProgress = 0;
    }

    clearCurrentImage() {
        this.previewUrl = null;
        this.currentImageUrl = undefined;
        this.imageUploaded.emit('');
    }
}
