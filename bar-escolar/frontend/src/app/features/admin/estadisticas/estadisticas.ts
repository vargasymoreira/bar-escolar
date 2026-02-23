import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  BarChart3,
  Package,
  PieChart,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
  Filter,
  Calendar,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-angular';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import {
  StatsService,
  SalesByDay,
  BestSellingProduct,
  CategorySales,
} from '../../../core/services/stats.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit, AfterViewInit, OnDestroy {
  // Icons
  readonly BarChart3 = BarChart3;
  readonly Package = Package;
  readonly PieChart = PieChart;
  readonly TrendingUp = TrendingUp;
  readonly DollarSign = DollarSign;
  readonly ShoppingCart = ShoppingCart;
  readonly Download = Download;
  readonly Filter = Filter;
  readonly Calendar = Calendar;
  readonly X = X;
  readonly ArrowUp = ArrowUp;
  readonly ArrowDown = ArrowDown;

  // Chart references
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('productsChart') productsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart')
  categoriesChartRef!: ElementRef<HTMLCanvasElement>;

  private salesChart?: Chart;
  private productsChart?: Chart;
  private categoriesChart?: Chart;

  loading: boolean = true;

  // Filters
  selectedPeriod: 'hoy' | 'semana' | 'mes' | 'año' | 'personalizado' = 'semana';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Data
  salesByDay: SalesByDay[] = [];
  bestSelling: BestSellingProduct[] = [];
  categories: CategorySales[] = [];

  // Summary metrics
  totalIngresos: number = 0;
  totalPedidos: number = 0;
  totalProductosVendidos: number = 0;
  ticketPromedio: number = 0;
  cambioIngresos: number = 0;

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.inicializarFechas();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  ngOnDestroy(): void {
    if (this.salesChart) this.salesChart.destroy();
    if (this.productsChart) this.productsChart.destroy();
    if (this.categoriesChart) this.categoriesChart.destroy();
  }

  inicializarFechas(): void {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = hace7Dias.toISOString().split('T')[0];
  }

  cambiarPeriodo(periodo: 'hoy' | 'semana' | 'mes' | 'año'): void {
    this.selectedPeriod = periodo;
    const hoy = new Date();
    this.fechaFin = hoy.toISOString().split('T')[0];

    switch (periodo) {
      case 'hoy':
        this.fechaInicio = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        const hace7Dias = new Date();
        hace7Dias.setDate(hoy.getDate() - 7);
        this.fechaInicio = hace7Dias.toISOString().split('T')[0];
        break;
      case 'mes':
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        this.fechaInicio = hace30Dias.toISOString().split('T')[0];
        break;
      case 'año':
        const hace365Dias = new Date();
        hace365Dias.setDate(hoy.getDate() - 365);
        this.fechaInicio = hace365Dias.toISOString().split('T')[0];
        break;
    }

    this.loadStats();
  }

  aplicarFiltrosPersonalizados(): void {
    if (this.fechaInicio && this.fechaFin) {
      this.selectedPeriod = 'personalizado';
      this.loadStats();
    }
  }

  limpiarFiltros(): void {
    this.selectedPeriod = 'semana';
    this.inicializarFechas();
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    const dias = this.calcularDias();

    // Load sales by day
    this.statsService.getSalesByDay(dias).subscribe({
      next: (data) => {
        this.salesByDay = data;
        this.calcularMetricas();
        setTimeout(() => this.createSalesChart(), 100);
      },
      error: (err) => console.error('Error loading sales by day:', err),
    });

    // Load best selling products
    this.statsService.getBestSelling(5).subscribe({
      next: (data) => {
        this.bestSelling = data;
        setTimeout(() => this.createProductsChart(), 100);
      },
      error: (err) => console.error('Error loading best selling:', err),
    });

    // Load categories
    this.statsService.getSalesByCategory().subscribe({
      next: (data) => {
        this.categories = data;
        setTimeout(() => this.createCategoriesChart(), 100);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      },
    });
  }

  calcularDias(): number {
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calcularMetricas(): void {
    this.totalIngresos = this.salesByDay.reduce(
      (sum, day) => sum + day.revenue,
      0
    );
    this.totalPedidos = this.salesByDay.reduce(
      (sum, day) => sum + day.orders,
      0
    );
    this.totalProductosVendidos = this.salesByDay.reduce(
      (sum, day) => sum + day.sales,
      0
    );
    this.ticketPromedio =
      this.totalPedidos > 0 ? this.totalIngresos / this.totalPedidos : 0;

    // Calcular cambio porcentual (ejemplo simulado)
    this.cambioIngresos = Math.random() * 20 - 5; // Entre -5% y +15%
  }

  descargarPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Estadísticas', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${this.fechaInicio} — ${this.fechaFin}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, 35, { align: 'center' });

    // --- Resumen ---
    doc.setTextColor(26, 31, 54);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, 52);

    const resumenData = [
      ['Ingresos Totales', `$${this.totalIngresos.toFixed(2)}`],
      ['Pedidos Totales', `${this.totalPedidos}`],
      ['Productos Vendidos', `${this.totalProductosVendidos}`],
      ['Ticket Promedio', `$${this.ticketPromedio.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: 56,
      head: [['Métrica', 'Valor']],
      body: resumenData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 11, cellPadding: 6 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    // --- Ventas por Día ---
    let currentY = (doc as any).lastAutoTable.finalY + 14;

    if (currentY > 240) { doc.addPage(); currentY = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ventas por Día', 14, currentY);

    const ventasData = this.salesByDay.map((d) => [
      new Date(d.date).toLocaleDateString('es-ES'),
      `${d.sales}`,
      `$${d.revenue.toFixed(2)}`,
      `${d.orders}`,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Fecha', 'Ventas', 'Ingresos', 'Pedidos']],
      body: ventasData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    // --- Productos Más Vendidos ---
    currentY = (doc as any).lastAutoTable.finalY + 14;

    if (currentY > 240) { doc.addPage(); currentY = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Productos Más Vendidos', 14, currentY);

    const productosData = this.bestSelling.map((p) => [
      p.producto?.nombre || 'N/A',
      `${p.totalSold}`,
      `$${p.revenue.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Producto', 'Unidades', 'Ingresos']],
      body: productosData,
      theme: 'grid',
      headStyles: { fillColor: [118, 75, 162], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    // --- Ventas por Categoría ---
    currentY = (doc as any).lastAutoTable.finalY + 14;

    if (currentY > 240) { doc.addPage(); currentY = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ventas por Categoría', 14, currentY);

    const categoriasData = this.categories.map((c) => [
      c.category,
      `${c.sales}`,
      `$${c.revenue.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Categoría', 'Ventas', 'Ingresos']],
      body: categoriasData,
      theme: 'grid',
      headStyles: { fillColor: [67, 233, 123], textColor: [26, 31, 54], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    // --- Footer ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`reporte_estadisticas_${this.fechaInicio}_${this.fechaFin}.pdf`);
  }

  descargarExcel(): void {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Bar Escolar';
    wb.created = new Date();

    const titleFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: '667EEA' } };
    const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4338CA' } };
    const altRowFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F3FF' } };
    const totalsFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E1B4B' } };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } },
    };

    const styleHeaderRow = (row: ExcelJS.Row, colCount: number) => {
      row.eachCell((cell, colNumber) => {
        if (colNumber <= colCount) {
          cell.fill = headerFill;
          cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = thinBorder;
        }
      });
      row.height = 28;
    };

    const styleDataRows = (ws: ExcelJS.Worksheet, startRow: number, endRow: number, colCount: number) => {
      for (let r = startRow; r <= endRow; r++) {
        const row = ws.getRow(r);
        row.eachCell((cell, colNumber) => {
          if (colNumber <= colCount) {
            cell.border = thinBorder;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if ((r - startRow) % 2 === 1) {
              cell.fill = altRowFill;
            }
          }
        });
        row.height = 22;
      }
    };

    const styleTotalRow = (row: ExcelJS.Row, colCount: number) => {
      row.eachCell((cell, colNumber) => {
        if (colNumber <= colCount) {
          cell.fill = totalsFill;
          cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = thinBorder;
        }
      });
      row.height = 26;
    };

    const addTitleBlock = (ws: ExcelJS.Worksheet, title: string, colCount: number): number => {
      ws.mergeCells(1, 1, 1, colCount);
      const titleCell = ws.getCell('A1');
      titleCell.value = title;
      titleCell.fill = titleFill;
      titleCell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 16 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 40;

      ws.mergeCells(2, 1, 2, colCount);
      const subCell = ws.getCell('A2');
      subCell.value = `Período: ${this.fechaInicio}  -  ${this.fechaFin}   |   Generado: ${new Date().toLocaleString('es-ES')}`;
      subCell.font = { italic: true, color: { argb: '6B7280' }, size: 10 };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(2).height = 24;

      ws.getRow(3).height = 8; // spacer
      return 4; // next row
    };

    // ========= HOJA 1: RESUMEN =========
    const wsResumen = wb.addWorksheet('Resumen');
    wsResumen.columns = [
      { width: 24 }, { width: 20 }, { width: 18 }, { width: 18 },
    ];
    let row = addTitleBlock(wsResumen, 'REPORTE DE ESTADÍSTICAS - BAR ESCOLAR', 4);

    const hdrRes = wsResumen.getRow(row);
    hdrRes.values = ['Métrica', 'Valor', '', ''];
    styleHeaderRow(hdrRes, 2);
    row++;

    const metricas = [
      ['Ingresos Totales', `$${this.totalIngresos.toFixed(2)}`],
      ['Pedidos Totales', this.totalPedidos],
      ['Productos Vendidos', this.totalProductosVendidos],
      ['Ticket Promedio', `$${this.ticketPromedio.toFixed(2)}`],
    ];
    const resStart = row;
    metricas.forEach((m) => {
      const r = wsResumen.getRow(row);
      r.values = [m[0], m[1]];
      row++;
    });
    styleDataRows(wsResumen, resStart, row - 1, 2);

    // ========= HOJA 2: VENTAS DIARIAS =========
    const wsVentas = wb.addWorksheet('Ventas Diarias');
    wsVentas.columns = [
      { width: 28 }, { width: 16 }, { width: 16 }, { width: 12 }, { width: 16 },
    ];
    row = addTitleBlock(wsVentas, 'VENTAS DIARIAS DETALLADAS', 5);

    const hdrVentas = wsVentas.getRow(row);
    hdrVentas.values = ['Fecha', 'Unidades', 'Ingresos ($)', 'Pedidos', 'Ticket Prom.'];
    styleHeaderRow(hdrVentas, 5);
    row++;

    const ventasStart = row;
    this.salesByDay.forEach((d) => {
      const ticketProm = d.orders > 0 ? (d.revenue / d.orders).toFixed(2) : '0.00';
      const r = wsVentas.getRow(row);
      r.values = [
        new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        d.sales,
        `$${d.revenue.toFixed(2)}`,
        d.orders,
        `$${ticketProm}`,
      ];
      row++;
    });
    styleDataRows(wsVentas, ventasStart, row - 1, 5);

    const totVentas = wsVentas.getRow(row);
    totVentas.values = ['TOTALES', this.totalProductosVendidos, `$${this.totalIngresos.toFixed(2)}`, this.totalPedidos, `$${this.ticketPromedio.toFixed(2)}`];
    styleTotalRow(totVentas, 5);

    // ========= HOJA 3: PRODUCTOS TOP =========
    const wsProductos = wb.addWorksheet('Productos Top');
    wsProductos.columns = [
      { width: 10 }, { width: 28 }, { width: 18 }, { width: 16 }, { width: 14 },
    ];
    row = addTitleBlock(wsProductos, 'PRODUCTOS MÁS VENDIDOS', 5);

    const hdrProd = wsProductos.getRow(row);
    hdrProd.values = ['#', 'Producto', 'Unidades', 'Ingresos ($)', '% Total'];
    styleHeaderRow(hdrProd, 5);
    row++;

    const totalRevenue = this.bestSelling.reduce((sum, p) => sum + p.revenue, 0);
    const prodStart = row;
    this.bestSelling.forEach((p, i) => {
      const pct = totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
      const r = wsProductos.getRow(row);
      r.values = [i + 1, p.producto?.nombre || 'N/A', p.totalSold, `$${p.revenue.toFixed(2)}`, `${pct}%`];
      row++;
    });
    styleDataRows(wsProductos, prodStart, row - 1, 5);

    const totProd = wsProductos.getRow(row);
    totProd.values = ['', 'TOTAL', this.bestSelling.reduce((s, p) => s + p.totalSold, 0), `$${totalRevenue.toFixed(2)}`, '100%'];
    styleTotalRow(totProd, 5);

    // ========= HOJA 4: CATEGORÍAS =========
    const wsCategorias = wb.addWorksheet('Categorías');
    wsCategorias.columns = [
      { width: 22 }, { width: 18 }, { width: 16 }, { width: 14 },
    ];
    row = addTitleBlock(wsCategorias, 'VENTAS POR CATEGORÍA', 4);

    const hdrCat = wsCategorias.getRow(row);
    hdrCat.values = ['Categoría', 'Ventas', 'Ingresos ($)', '% Total'];
    styleHeaderRow(hdrCat, 4);
    row++;

    const totalCatRevenue = this.categories.reduce((sum, c) => sum + c.revenue, 0);
    const catStart = row;
    this.categories.forEach((c) => {
      const pct = totalCatRevenue > 0 ? ((c.revenue / totalCatRevenue) * 100).toFixed(1) : '0.0';
      const r = wsCategorias.getRow(row);
      r.values = [c.category, c.sales, `$${c.revenue.toFixed(2)}`, `${pct}%`];
      row++;
    });
    styleDataRows(wsCategorias, catStart, row - 1, 4);

    const totCat = wsCategorias.getRow(row);
    totCat.values = ['TOTAL', this.categories.reduce((s, c) => s + c.sales, 0), `$${totalCatRevenue.toFixed(2)}`, '100%'];
    styleTotalRow(totCat, 4);

    // ========= GUARDAR =========
    wb.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_estadisticas_${this.fechaInicio}_${this.fechaFin}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  descargarGrafico(tipo: 'ventas' | 'productos' | 'categorias'): void {
    let chart: Chart | undefined;
    let nombre = '';

    switch (tipo) {
      case 'ventas':
        chart = this.salesChart;
        nombre = 'grafico_ventas';
        break;
      case 'productos':
        chart = this.productsChart;
        nombre = 'grafico_productos';
        break;
      case 'categorias':
        chart = this.categoriesChart;
        nombre = 'grafico_categorias';
        break;
    }

    if (chart) {
      const link = document.createElement('a');
      link.download = `${nombre}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = chart.toBase64Image();
      link.click();
    }
  }

  createSalesChart(): void {
    if (!this.salesChartRef || !this.salesByDay || this.salesByDay.length === 0)
      return;

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.salesByDay.map((d) => {
          const date = new Date(d.date);
          return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          });
        }),
        datasets: [
          {
            label: 'Ingresos ($)',
            data: this.salesByDay.map((d) => d.revenue),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1a1f36',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e5e7eb',
            },
            ticks: {
              callback: function (value) {
                return '$' + value;
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    this.salesChart = new Chart(ctx, config);
  }

  createProductsChart(): void {
    if (
      !this.productsChartRef ||
      !this.bestSelling ||
      this.bestSelling.length === 0
    )
      return;

    const ctx = this.productsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.productsChart) {
      this.productsChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.bestSelling.map((p) => p.producto?.nombre || 'Producto'),
        datasets: [
          {
            label: 'Unidades Vendidas',
            data: this.bestSelling.map((p) => p.totalSold),
            backgroundColor: [
              '#667eea',
              '#764ba2',
              '#f093fb',
              '#4facfe',
              '#43e97b',
            ],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1a1f36',
            padding: 12,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e5e7eb',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    this.productsChart = new Chart(ctx, config);
  }

  createCategoriesChart(): void {
    if (
      !this.categoriesChartRef ||
      !this.categories ||
      this.categories.length === 0
    )
      return;

    const ctx = this.categoriesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.categories.map((c) => c.category),
        datasets: [
          {
            data: this.categories.map((c) => c.revenue),
            backgroundColor: [
              '#667eea',
              '#764ba2',
              '#f093fb',
              '#4facfe',
              '#43e97b',
              '#fa709a',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: '#1a1f36',
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: $${value.toFixed(2)}`;
              },
            },
          },
        },
      },
    };

    this.categoriesChart = new Chart(ctx, config);
  }
}
