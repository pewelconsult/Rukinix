import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { ProcessedSale, Sale } from '../../../interfaces/sales';




@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
  private http = inject(HttpClient);
  private baseurl = new BaseUrl();
  mainSales: Sale[] = [];
  processedSales: ProcessedSale[] = [];
  startDate:string = '2024-12-26'; // Replace with actual date from input
  endDate:string = '2024-12-27';
  processedSales4Today : ProcessedSale[] = [];
  processedSales4Week : ProcessedSale[] = [];
  processedSales4Month : ProcessedSale[] = [];

  totalSales4Today: number = 0;
  totalSales4TheWeek: number = 0;
  totalSales4TheMonth: number = 0;
  totalOrders4Today: number=0;

  ngOnInit(): void {
    this.getAllSales(this.startDate, this.endDate, this.processedSales);
    this.getSaleForToday()
    this.getSalesForThisWeek()
    this.getSalesForTheMonth()
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllSales(startDate: string, endDate: string, arrey: ProcessedSale[]) {
    const headers = this.getAuthHeaders();
    const params = { startDate, endDate }; // Query parameters
    this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
        next: (res: any) => {
            this.mainSales = res.data.sales;
            const processed = this.mainSales.map(sale => 
                sale.items.map(item => ({
                    productCode: item.id,
                    productName: item.itemName,
                    customerName: sale.customerName,
                    quantity: item.quantity,
                    totalAmount: item.sellingPrice * item.quantity,
                    paymentMode: sale.paymentMode,
                    date: new Date(sale.createOn).toLocaleDateString(),
                }))
            ).flat();

            // Update the provided array reference
            arrey.length = 0; // Clear the existing array
            arrey.push(...processed); // Add new data
        },
        error: (error) => {
            alert('Failed to fetch sales data');
        }
    });
}



getSaleForToday() {
  const today = new Date();
  const tommorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Subtract one day for yesterday
  const endDate = tommorrow.toISOString().split('T')[0];
  const startDate = today.toISOString().split('T')[0];

  const headers = this.getAuthHeaders();
  const params = { startDate, endDate };
  
  this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
      next: (res: any) => {
          this.mainSales = res.data.sales;
          const processed = this.mainSales.map(sale => 
              sale.items.map(item => ({
                  productCode: item.id,
                  productName: item.itemName,
                  customerName: sale.customerName,
                  quantity: item.quantity,
                  totalAmount: item.sellingPrice * item.quantity,
                  paymentMode: sale.paymentMode,
                  date: new Date(sale.createOn).toLocaleDateString(),
              }))
          ).flat();

          this.processedSales4Today = processed;
          this.totalOrders4Today = this.processedSales4Today.length
          // Calculate total sales for today
          this.totalSales4Today = this.processedSales4Today.reduce((sum, sale) => sum + sale.totalAmount, 0);
      },
      error: (error) => {
          alert('Failed to fetch today\'s sales data');
      }
  });
}


getSalesForThisWeek() {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday  
  const lastDayOfWeek = new Date(today.setDate(firstDayOfWeek.getDate() + 6)); // Sunday
 
  const startDate = firstDayOfWeek.toISOString().split('T')[0];
  const endDate = new Date(lastDayOfWeek.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
 
  const headers = this.getAuthHeaders();
  const params = { startDate, endDate };
  
  this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
      next: (res: any) => {
          this.mainSales = res.data.sales;
          const processed = this.mainSales.map(sale => 
              sale.items.map(item => ({
                  productCode: item.id,
                  productName: item.itemName,
                  customerName: sale.customerName,
                  quantity: item.quantity,
                  totalAmount: item.sellingPrice * item.quantity,
                  paymentMode: sale.paymentMode,
                  date: new Date(sale.createOn).toLocaleDateString(),
              }))
          ).flat();
 
          this.processedSales4Week = processed;
          // Calculate total sales for the week
          this.totalSales4TheWeek = this.processedSales4Week.reduce((sum, sale) => sum + sale.totalAmount, 0);
      },
      error: (error) => {
          alert('Failed to fetch weekly sales data');
      }
  });
 }
 
 getSalesForTheMonth() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
 
  const startDate = firstDayOfMonth.toISOString().split('T')[0];
  const endDate = new Date(lastDayOfMonth.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
 
  const headers = this.getAuthHeaders();
  const params = { startDate, endDate };
  
  this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
      next: (res: any) => {
          this.mainSales = res.data.sales;
          const processed = this.mainSales.map(sale => 
              sale.items.map(item => ({
                  productCode: item.id,
                  productName: item.itemName,
                  customerName: sale.customerName,
                  quantity: item.quantity,
                  totalAmount: item.sellingPrice * item.quantity,
                  paymentMode: sale.paymentMode,
                  date: new Date(sale.createOn).toLocaleDateString(),
              }))
          ).flat();
 
          this.processedSales4Month = processed;
          // Calculate total sales for the month
          this.totalSales4TheMonth = this.processedSales4Month.reduce((sum, sale) => sum + sale.totalAmount, 0);
      },
      error: (error) => {
          alert('Failed to fetch monthly sales data');
      }
  });
 }



  addCommas(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) {
    throw new Error('Input must be a valid number or numeric string');
  }
  // Format the number with commas
  return numericValue.toLocaleString();
}


}
