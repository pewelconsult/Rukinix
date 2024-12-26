import { Component, ElementRef, ViewChild } from '@angular/core';
import { AdminsidebarComponent } from '../adminsidebar/adminsidebar.component';
import { Chart } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [AdminsidebarComponent, FormsModule, CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent {
  @ViewChild('revenueChart') revenueChart!: ElementRef;
  @ViewChild('revenueDistributionChart') revenueDistributionChart!: ElementRef;
  @ViewChild('userActivityChart') userActivityChart!: ElementRef;
  @ViewChild('subscriptionGrowthChart') subscriptionGrowthChart!: ElementRef;

  selectedDateRange = '30';
  Math = Math; // For using Math in template

  keyMetrics = [
    { title: 'Total Revenue', value: '$128,490', trend: 12.5, progress: 75 },
    { title: 'Active Users', value: '2,845', trend: 8.2, progress: 65 },
    { title: 'New Subscriptions', value: '385', trend: 15.7, progress: 85 },
    { title: 'Churn Rate', value: '2.4%', trend: -0.5, progress: 35 }
  ];

  topCompanies = [
    {
      name: 'Tech Corp',
      industry: 'Technology',
      revenue: 45000,
      users: 1200,
      growth: 15.5,
      status: 'Active',
      statusClass: 'bg-success text-white',
      iconClass: 'bg-primary-light text-primary'
    },
    // Add more companies...
  ];

  ngOnInit() {
    this.initializeCharts();
  }

  initializeCharts() {
    this.initializeRevenueChart();
    this.initializeRevenueDistributionChart();
    this.initializeUserActivityChart();
    this.initializeSubscriptionGrowthChart();
  }

  initializeRevenueChart() {
    const ctx = this.revenueChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [65000, 75000, 72000, 85000, 92000, 128490],
            borderColor: '#3498db',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(52, 152, 219, 0.1)'
          },
          {
            label: 'Expenses',
            data: [45000, 48000, 50000, 55000, 58000, 65000],
            borderColor: '#e74c3c',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(231, 76, 60, 0.1)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  initializeRevenueDistributionChart() {
    const ctx = this.revenueDistributionChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Enterprise', 'Pro', 'Basic'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: ['#3498db', '#2ecc71', '#f1c40f']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  initializeUserActivityChart() {
    const ctx = this.userActivityChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Active Users',
          data: [1200, 1350, 1450, 1250, 1400, 950, 850],
          backgroundColor: '#2ecc71'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  initializeSubscriptionGrowthChart() {
    const ctx = this.subscriptionGrowthChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Subscriptions',
          data: [250, 280, 300, 320, 350, 385],
          borderColor: '#9b59b6',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateData() {
    // Implement data update logic based on selectedDateRange
  }


}
