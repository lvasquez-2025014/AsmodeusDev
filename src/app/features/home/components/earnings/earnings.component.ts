import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Chart, registerables } from 'chart.js';
import { EarningsData, Transaction } from '@models/index';

Chart.register(...registerables);

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss']
})
export class EarningsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('earningsChart') earningsChartRef!: ElementRef<HTMLCanvasElement>;

  earningsData: EarningsData = { weekly: [], totalRevenue: 0, totalOrders: 0, transactions: [] };
  transactions: Transaction[] = [];

  private charts: Chart[] = [];

  get totalRevenue(): number {
    return this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return Math.abs(this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEarnings();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initEarningsChart(), 100);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadEarnings(): void {
    this.api.get<any>('orders/earnings').subscribe({
      next: (res) => {
        this.earningsData = res.data || { weekly: [], totalRevenue: 0, totalOrders: 0, transactions: [] };
        this.transactions = this.earningsData.transactions || [];
        setTimeout(() => this.initEarningsChart(), 50);
      },
      error: () => {}
    });
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private initEarningsChart(): void {
    this.destroyCharts();
    if (!this.earningsChartRef) return;
    const ctx = this.earningsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const weeklyData = this.earningsData.weekly || [];
    const labels = weeklyData.map((d: any) => d.label);
    const data = weeklyData.map((d: any) => d.amount);

    const gradientIncome = ctx.createLinearGradient(0, 0, 0, 320);
    gradientIncome.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
    gradientIncome.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
    gradientIncome.addColorStop(1, 'rgba(168, 85, 247, 0)');

    const gradientExpense = ctx.createLinearGradient(0, 0, 0, 320);
    gradientExpense.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
    gradientExpense.addColorStop(1, 'rgba(239, 68, 68, 0)');

    this.charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Ingresos',
            data: data.length ? data : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#22d3ee',
            backgroundColor: gradientIncome,
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#22d3ee',
            pointBorderColor: '#090a0f',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#22d3ee',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Gastos',
            data: data.length ? data.map(() => 0) : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#a855f7',
            backgroundColor: gradientExpense,
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#a855f7',
            pointBorderColor: '#090a0f',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#a855f7',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2
          }
        ]
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
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 13, weight: 600, family: 'Inter' },
            bodyFont: { size: 12, family: 'Inter' },
            displayColors: true,
            boxPadding: 6,
            callbacks: {
              label: (context: any) => ' ' + context.dataset.label + ': $' + context.parsed.y.toFixed(2)
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { color: '#64748b', font: { size: 11, family: 'Inter', weight: 500 }, padding: 8 },
            border: { display: false }
          },
          y: {
            min: 0,
            ticks: {
              color: '#64748b',
              font: { size: 11, family: 'Inter', weight: 500 },
              padding: 12,
              stepSize: 0.25,
              callback: (v: any) => '$' + v.toFixed(2)
            },
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            border: { display: false }
          }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' }
      }
    }));
  }
}
