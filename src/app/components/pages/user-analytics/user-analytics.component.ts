// user-analytics.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { Chart } from 'chart.js/auto';
import * as XLSX from 'xlsx';


interface AnalyticsData {
  date: Date;
  total: number;
  items: number;
  paymentMode: string;
}

interface GroupedData {
  [key: string]: number;
 }

@Component({
  selector: 'app-user-analytics',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './user-analytics.component.html',
  styleUrl: './user-analytics.component.css'
})
export class UserAnalyticsComponent implements OnInit {
  private http = inject(HttpClient);
  private baseurl = new BaseUrl();

  Object = Object; // Add this line

  
  reportType = 'sales';
  chartType = 'line';
  frequency = 'daily';
  periods = 10;
  chart: any;
  processedData: AnalyticsData[] = [];
  groupedData: GroupedData = {};
  orderCounts: {[key: string]: number} = {};


  ngOnInit() {
    this.generateReport();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTotalSales(): number {
    return Object.values(this.groupedData).reduce((sum, value) => sum + value, 0);
  }
 
  getTotalOrders(): number {
    return Object.values(this.orderCounts).reduce((sum, value) => sum + value, 0);
  }
 
  getAverageOrderValue(): number {
    const totalSales = this.getTotalSales();
    const totalOrders = this.getTotalOrders();
    return totalOrders ? totalSales / totalOrders : 0;
  }

  
  generateReport() {
    const { startDate, endDate } = this.getDateRange();
    const headers = this.getAuthHeaders();
    const params = { startDate, endDate };
   
    this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
      next: (res: any) => {
        const sales = res.data.sales;
        this.processedData = sales.map((sale: any) => ({
          date: new Date(sale.createOn),
          total: sale.total,
          items: sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          paymentMode: sale.paymentMode,
          orderCount: 1
        }));
   
        this.updateGroupedData();
        this.updateChart();
      },
      error: (error) => {
        console.error('Failed to fetch analytics data:', error);
      }
    });
   }
  

 
   private getDateRange() {
    const endDate = new Date();
    const startDate = new Date();
   
    switch(this.frequency) {
      case 'daily':
        startDate.setDate(endDate.getDate() - this.periods);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - (this.periods * 7));
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - this.periods);
        break;
    }
   
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
   }


  updateChart() {
    const groupedData = this.groupDataByFrequency();
    
    if (this.chart) {
      this.chart.destroy();
    }
   
    this.chart = new Chart('analyticsChart', {
      type: this.chartType as any,
      data: {
        labels: Object.keys(groupedData),
        datasets: [{
          label: 'Total Sales',
          data: Object.values(groupedData),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: `${this.frequency.charAt(0).toUpperCase() + this.frequency.slice(1)} Sales Report`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context: any) {
                return ` Sales: $${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
   }

  private groupDataByFrequency(): GroupedData {
    return this.processedData.reduce((acc: GroupedData, item) => {
      const key = this.getGroupKey(new Date(item.date));
      acc[key] = (acc[key] || 0) + item.total;
      return acc;
    }, {});
   }
   

  private getGroupKey(date: Date): string {
    switch(this.frequency) {
      case 'daily':
        return date.toLocaleDateString();
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toLocaleString('default', { month: 'long' });
      default:
        return date.toLocaleDateString();
    }
  }


  downloadExcel() {
    // Create data for excel based on aggregated table data
    const excelData = Object.keys(this.groupedData).map(period => ({
      Period: period,
      'Total Sales': this.groupedData[period],
      'Number of Orders': this.orderCounts[period],
      'Average Order Value': this.groupedData[period] / this.orderCounts[period]
    }));
   
    // Add totals row
    excelData.push({
      Period: 'Total',
      'Total Sales': this.getTotalSales(),
      'Number of Orders': this.getTotalOrders(),
      'Average Order Value': this.getAverageOrderValue()
    });
   
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics Report');
    XLSX.writeFile(wb, `sales_analytics_${this.frequency}_report.xlsx`);
   }


  
  printReport() {
    window.print();
  }

  private updateGroupedData() {
    this.groupedData = {};
    this.orderCounts = {};
    
    this.processedData.forEach(item => {
      const key = this.getGroupKey(new Date(item.date));
      this.groupedData[key] = (this.groupedData[key] || 0) + item.total;
      this.orderCounts[key] = (this.orderCounts[key] || 0) + 1;
    });
  }

  addCommas(value: number | string | null): string {
    // Early return if value is null or undefined
    if (value === null || value === undefined) {
        return '0'; // or return '' or any default value you prefer
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
        return '0'; // Instead of throwing error, return a default value
    }
    
    return numericValue.toLocaleString();
}

}