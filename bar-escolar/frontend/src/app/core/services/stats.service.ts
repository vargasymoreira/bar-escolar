import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SalesByDay {
    date: string;
    sales: number;
    revenue: number;
    orders: number;
}

export interface BestSellingProduct {
    producto: any;
    totalSold: number;
    revenue: number;
}

export interface RevenueStats {
    totalRevenue: number;
    totalOrders: number;
    totalItems: number;
    averageOrderValue: number;
    period: string;
}

export interface PeakHour {
    hour: number;
    orders: number;
}

export interface CategorySales {
    category: string;
    sales: number;
    revenue: number;
}

export interface DashboardSummary {
    totalPedidos: number;
    pedidosHoy: number;
    totalProductos: number;
    totalIngresos: number;
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {
    private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    getSalesByDay(days: number = 7): Observable<SalesByDay[]> {
        return this.http.get<SalesByDay[]>(`${this.apiUrl}/stats/sales-by-day?days=${days}`);
    }

    getBestSelling(limit: number = 10): Observable<BestSellingProduct[]> {
        return this.http.get<BestSellingProduct[]>(`${this.apiUrl}/stats/best-selling?limit=${limit}`);
    }

    getRevenue(period: 'week' | 'month' | 'year' = 'month'): Observable<RevenueStats> {
        return this.http.get<RevenueStats>(`${this.apiUrl}/stats/revenue?period=${period}`);
    }

    getPeakHours(): Observable<PeakHour[]> {
        return this.http.get<PeakHour[]>(`${this.apiUrl}/stats/peak-hours`);
    }

    getSalesByCategory(): Observable<CategorySales[]> {
        return this.http.get<CategorySales[]>(`${this.apiUrl}/stats/categories`);
    }

    getDashboardSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.apiUrl}/stats/summary`);
    }
}
