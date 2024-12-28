import { Component, inject, Inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';

@Component({
  selector: 'app-storemanager',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './storemanager.component.html',
  styleUrl: './storemanager.component.css'
})
export class StoremanagerComponent implements OnInit{
  totalItems: any;
  ngOnInit(): void {
    this.getTotalRevenueForTheYear()
  }

  totalRevenue:number =0 
  thisCurrentYear = new Date().getFullYear(); 
  allproducts: any[] = [];
  totalCost = 0;
  lowStockItems: any[] = []
  totalLowStocks=0
  baseurl = new BaseUrl()
  private http = inject(HttpClient)

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }


    getTotalRevenueForTheYear() {
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const nextYear = currentYear + 1;
      const endDate = `${nextYear}-01-01`;
  
      const params = {
          startDate: startDate,
          endDate: endDate
      };
      const headers = this.getAuthHeaders();
  
      this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe(
          (res: any) => {
              if (res.success) {
                  const sales = res.data.sales;
                  this.totalRevenue = sales.reduce((acc: number, sale: any) => acc + sale.total, 0);
              } else {
                  alert("Failed to fetch sales data");
              }
          },
          (err: any) => {
              alert("Error fetching total revenue");
          }
      );
  }
  
  
  
  

  getAllProducts() {
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url+"products", {headers}).subscribe((res:any)=> {
      this.allproducts = res.data;
      this.totalItems = this.allproducts.length
      this.calculateTotals();
      this.calculateLowStocks()
    }, error => {
    })
   }
   
   
   calculateTotals() {
    this.totalCost = this.allproducts.reduce((sum, product) => 
      sum + (product.costPrice * product.quantity), 0);
    
    this.totalRevenue = this.allproducts.reduce((sum, product) => 
      sum + (product.sellingPrice * product.quantity), 0);
  }
  
  
  calculateLowStocks() {
    // Filter products where quantity is less than or equal to reorderLevel
    this.lowStockItems = this.allproducts.filter(product => 
      product.quantity <= product.reorderLevel
    );
    this.totalLowStocks = this.lowStockItems.length;
  }
  


}
