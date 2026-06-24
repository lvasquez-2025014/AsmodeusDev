import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '@core/services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('analyticsVisits') analyticsVisitsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('analyticsSales') analyticsSalesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('analyticsConversion') analyticsConversionRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  loading = true;

  totalUsers = 0;
  totalOrders = 0;
  conversionRate = 0;
  totalRevenue = 0;
  userGrowth = 0;
  salesGrowth = 0;

  labels: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  visitsData: number[] = [0, 0, 0, 0, 0, 0, 0];
  ordersData: number[] = [0, 0, 0, 0, 0, 0, 0];
  conversionData: number[] = [0, 0, 0];

  constructor(private api: ApiService) {}

  ngAfterViewInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  loadAnalytics(): void {
    this.api.get<any>('admin/analytics').subscribe({
      next: (res) => {
        const d = res.data;
        this.totalUsers = d.kpi.totalUsers;
        this.totalOrders = d.kpi.totalOrders;
        this.conversionRate = d.kpi.conversionRate;
        this.totalRevenue = d.kpi.totalRevenue;
        this.userGrowth = d.growth.users;
        this.salesGrowth = d.growth.sales;
        this.labels = d.charts.labels;
        this.visitsData = d.charts.visits;
        this.ordersData = d.charts.orders;
        this.conversionData = [d.conversion.completed, d.conversion.cancelled, d.conversion.pending];
        this.loading = false;
        setTimeout(() => this.initCharts(), 100);
      },
      error: () => {
        this.loading = false;
        setTimeout(() => this.initCharts(), 100);
      }
    });
  }

  private initCharts(): void {
    this.destroyCharts();
    this.initVisitsChart();
    this.initSalesChart();
    this.initConversionChart();
  }

  private initVisitsChart(): void {
    if (!this.analyticsVisitsRef) return;
    const ctx = this.analyticsVisitsRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.3)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0)');

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Actividad',
          data: this.visitsData,
          borderColor: '#22d3ee',
          backgroundColor: grad,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#0a0c14',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11, weight: 500 as any } } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11, weight: 500 as any } }, beginAtZero: true }
        },
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    }));
  }

  private initSalesChart(): void {
    if (!this.analyticsSalesRef) return;
    const ctx = this.analyticsSalesRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Ventas',
          data: this.ordersData,
          backgroundColor: 'rgba(244, 114, 182, 0.7)',
          borderColor: '#f472b6',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11, weight: 500 as any } } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11, weight: 500 as any } }, beginAtZero: true }
        },
        animation: { duration: 800, easing: 'easeOutQuart' }
      }
    }));
  }

  private initConversionChart(): void {
    if (!this.analyticsConversionRef) return;
    const ctx = this.analyticsConversionRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completados', 'Cancelados', 'Pendientes'],
        datasets: [{
          data: this.conversionData,
          backgroundColor: ['#84cc16', '#ef4444', '#a78bfa'],
          borderColor: '#0a0c14',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', padding: 16, usePointStyle: true, font: { size: 11, weight: 500 as any } }
          }
        },
        animation: { animateRotate: true, duration: 1200 }
      }
    }));
  }

  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
