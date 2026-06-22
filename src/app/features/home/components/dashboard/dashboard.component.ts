import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { Chart, registerables } from 'chart.js';
import { StatsCard, TopProduct, ActivityItem } from '@models/index';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  user: any = null;
  discordUrl = 'https://discord.gg/HazXhwWMS';
  todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  statsCards: StatsCard[] = [
    { title: 'Ganancias Totales', value: '$0.00', change: '', changeType: 'positive', icon: 'fas fa-dollar-sign', color: 'cyan' },
    { title: 'Ventas Totales', value: '0', change: '', changeType: 'positive', icon: 'fas fa-shopping-bag', color: 'pink' },
    { title: 'Usuarios', value: '0', change: '', changeType: 'positive', icon: 'fas fa-users', color: 'lime' },
    { title: 'Productos', value: '0', change: '', changeType: 'positive', icon: 'fas fa-box', color: 'violet' },
  ];

  topProducts: TopProduct[] = [];
  recentActivity: ActivityItem[] = [];

  private charts: Chart[] = [];

  private userColors: Record<string, string> = {};
  private colorPalette = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
    '#3498db', '#9b59b6', '#e84393', '#00b894', '#6c5ce7',
    '#fd79a8', '#00cec9', '#a29bfe', '#ffeaa7', '#fab1a0',
    '#74b9ff', '#55efc4', '#ff7675', '#fdcb6e', '#a29bfe'
  ];

  getUserColor(name: string): string {
    if (!name) return this.colorPalette[0];
    if (this.userColors[name]) return this.userColors[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % this.colorPalette.length;
    this.userColors[name] = this.colorPalette[idx];
    return this.userColors[name];
  }

  getTimeAgo(timestamp: any): string {
    if (!timestamp) return '';
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)}d`;
    return then.toLocaleDateString('es-ES');
  }

  constructor(
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.user;
    this.loadStats();
    this.loadTopProducts();
    this.loadActivity();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCharts(), 100);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadStats(): void {
    this.api.get<any>('admin/stats').subscribe({
      next: (res) => {
        const d = res.data;
        this.statsCards = [
          { title: 'Ganancias Totales', value: `$${(d.totalRevenue || 0).toFixed(2)}`, change: '', changeType: 'positive', icon: 'fas fa-dollar-sign', color: 'cyan' },
          { title: 'Ventas Totales', value: `${d.totalSales || 0}`, change: '', changeType: 'positive', icon: 'fas fa-shopping-bag', color: 'pink' },
          { title: 'Usuarios', value: `${d.totalUsers || 0}`, change: `${d.clientes || 0} clientes`, changeType: 'positive', icon: 'fas fa-users', color: 'lime' },
          { title: 'Productos', value: `${d.totalProducts || 0}`, change: `${d.vendedores || 0} vendedores`, changeType: 'positive', icon: 'fas fa-box', color: 'violet' },
        ];
      },
      error: () => {}
    });
  }

  loadTopProducts(): void {
    this.api.get<any>('products').subscribe({
      next: (res) => {
        const products = (res.data || [])
          .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 5);
        const maxSales = Math.max(...products.map((p: any) => p.sales || 0), 1);
        this.topProducts = products.map((p: any) => {
          const prices = p.prices || [];
          const minPrice = prices.length ? Math.min(...prices.map((pr: any) => pr.price)) : 0;
          const maxPrice = prices.length ? Math.max(...prices.map((pr: any) => pr.price)) : 0;
          return {
            name: p.name,
            sales: p.sales || 0,
            revenue: `$${((p.sales || 0) * minPrice).toFixed(2)}`,
            trend: ((p.sales || 0) / maxSales) * 100,
            priceRange: prices.length ? `$${minPrice} - $${maxPrice}` : 'Sin precios',
          };
        });
      },
      error: () => {}
    });
  }

  loadActivity(): void {
    this.api.get<any>('admin/activity').subscribe({
      next: (res) => { this.recentActivity = res.data || []; },
      error: () => {}
    });
  }

  private initCharts(): void {
    this.destroyCharts();
    this.initRevenueChart();
    this.initCategoryChart();
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private initRevenueChart(): void {
    if (!this.revenueChartRef) return;
    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.15)');
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Ingresos',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#22d3ee',
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0,
          fill: true,
          pointBackgroundColor: '#0a0c14',
          pointBorderColor: '#22d3ee',
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#22d3ee',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(18, 20, 30, 0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, weight: 600, family: 'Inter' },
            bodyFont: { size: 12, family: 'Inter' },
            callbacks: { label: (c: any) => ' Ingresos: $' + c.parsed.y.toFixed(2) }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { color: '#64748b', font: { size: 11, family: 'Inter', weight: 500 }, padding: 8 },
            border: { display: false }
          },
          y: {
            min: -1, max: 1,
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Inter', weight: 500 },
              padding: 12, stepSize: 0.2,
              callback: (v: any) => '$' + v.toFixed(1).replace('.', ',')
            },
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            border: { display: false }
          }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' }
      }
    }));
  }

  private initCategoryChart(): void {
    if (!this.categoryChartRef) return;
    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Panel VIP PC', 'Bypass APK', 'Panel Proxy Android', 'Panel Proxy iOS', 'Diamantes'],
        datasets: [{
          data: [1, 1, 1, 1, 1],
          backgroundColor: ['rgba(34, 211, 238, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(132, 204, 22, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(234, 179, 8, 0.8)'],
          borderColor: '#0d0f17',
          borderWidth: 3,
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(18, 20, 30, 0.95)', titleColor: '#e2e8f0', bodyColor: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    }));
  }
}
