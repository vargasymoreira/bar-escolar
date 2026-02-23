import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './skeleton-loader.html',
    styleUrl: './skeleton-loader.css',
})
export class SkeletonLoaderComponent {
    @Input() type: 'card' | 'table' | 'text' | 'circle' | 'chart' = 'card';
    @Input() count: number = 1;
    @Input() height: string = '100px';
    @Input() width: string = '100%';

    get items(): number[] {
        return Array(this.count).fill(0);
    }
}
