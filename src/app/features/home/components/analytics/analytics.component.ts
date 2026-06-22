import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

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

  ngAfterViewInit(): void {
    setTimeout(() => this.initAnalyticsCharts(), 100);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private initAnalyticsCharts(): void {
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    if (this.analyticsVisitsRef) {
      const ctx1 = this.analyticsVisitsRef.nativeElement.getContext('2d');
      if (ctx1) {
        const grad1 = ctx1.createLinearGradient(0, 0, 0, 200);
        grad1.addColorStop(0, 'rgba(34, 211, 238, 0.3)');
        grad1.addColorStop(1, 'rgba(34, 211, 238, 0)');
        this.charts.push(new Chart(ctx1, {
          type: 'line',
          data: {
            labels: weekDays,
            datasets: [{
              label: 'Visitas',
              data: [120, 190, 145, 210, 180, 240, 200],
              borderColor: '#22d3ee',
              backgroundColor: grad1,
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
              y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11, weight: 500 as any } } }
            },
            animation: { duration: 1000, easing: 'easeOutQuart' }
          }
        }));
      }
    }

    if (this.analyticsSalesRef) {
      const ctx2 = this.analyticsSalesRef.nativeElement.getContext('2d');
      if (ctx2) {
        this.charts.push(new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: weekDays,
            datasets: [{
              label: 'Ventas',
              data: [8, 12, 6, 15, 10, 20, 14],
              backgroundColor: [
                'rgba(244, 114, 182, 0.7)', 'rgba(244, 114, 182, 0.7)', 'rgba(244, 114, 182, 0.7)',
                'rgba(244, 114, 182, 0.9)', 'rgba(244, 114, 182, 0.7)', 'rgba(244, 114, 182, 0.9)', 'rgba(244, 114, 182, 0.7)'
              ],
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
              y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11, weight: 500 as any } } }
            },
            animation: { duration: 800, easing: 'easeOutQuart' }
          }
        }));
      }
    }

    if (this.analyticsConversionRef) {
      const ctx3 = this.analyticsConversionRef.nativeElement.getContext('2d');
      if (ctx3) {
        this.charts.push(new Chart(ctx3, {
          type: 'doughnut',
          data: {
            labels: ['Convertidos', 'Abandonados', 'Pendientes'],
            datasets: [{
              data: [32, 18, 50],
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
    }
  }
}
