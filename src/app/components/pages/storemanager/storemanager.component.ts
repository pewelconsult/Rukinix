import { Component, inject, Inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { Chart, registerables } from 'chart.js';



@Component({
  selector: 'app-storemanager',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './storemanager.component.html',
  styleUrl: './storemanager.component.css'
})
export class StoremanagerComponent implements OnInit{

  monthlyPurchases: number = 0;

  totalItems: any;
  
  ngOnInit(): void {
    this.getTotalRevenueForTheYear()
    this.getAllProducts();
    this.getAllSales();
    this.fetchDebtors()
    this.fetchExpenses(this.getStartOfMonth(), this.getEndOfMonth())
    this.getTotalMonthlyPurchases();

  }

  salesForTheWeek: number = 0;
  salesForTheMonth: number = 0;
  totalRevenue:number =0 
  thisCurrentYear = new Date().getFullYear(); 
  allproducts: any[] = [];
  totalCost = 0;
  totalProducts = 0;
  salesForToday = 0;
  pendingOrderTotal=0;
  totalExpenses = 0;
  totalDebts = 0;
  top10Sales4Today: any[] = [];
  top10Sales4TheWeek: any[] = [];
  top10Sales4TheMonth: any[] = [];
  salesOverviewForTheDayArray: any[] = [];
  baseurl = new BaseUrl()
  private http = inject(HttpClient)

  

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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


  getAllSales() {
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url + "sales", { headers }).subscribe(
      (res: any) => {
        if (res.success) {
          const sales = res.data.sales;
          
          this.salesOverviewForTheDayArray = this.getSalesOverviewForTheDay(sales);

          this.calculateSalesForToday(sales); 
          this.calculateSalesForTheWeek(sales); 
          this.calculateSalesForTheMonth(sales); 

          // Calculate top 10 products
          this.getTop10ProductsForToday(sales);
          this.getTop10ProductsForTheWeek(sales);
          this.getTop10ProductsForTheMonth(sales);
        } else {
          console.error("Failed to fetch sales data");
        }
      },
      (err: any) => {
        console.error("Error fetching sales data", err);
      }
    );
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

    this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
        next: (res: any) => {
            if (res.success) {
                const sales = res.data.sales;
                this.totalRevenue = sales.reduce((acc: number, sale: any) => {
                    // Calculate total for each sale by summing its items
                    const saleTotal = sale.items.reduce((itemAcc: number, item: any) => 
                        itemAcc + (item.quantity * item.sellingPrice), 0);
                    return acc + saleTotal;
                }, 0);
            }
        },
        error: (err: any) => {
            console.error("Error fetching total revenue:", err);
        }
    });
}
  

  getAllProducts() {
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url+"products", {headers}).subscribe((res:any)=> {
      this.allproducts = res.data;
      this.totalItems = this.allproducts.length
      this.calculateTotals();
    }, error => {
    })
   }
   
   
   calculateTotals() {
    this.totalCost = this.allproducts.reduce((sum, product) => 
      sum + (product.costPrice * product.quantity), 0); 
  }
  
  

  calculateSalesForToday(sales: any[]) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
 
    this.salesForToday = sales
      .filter(sale => {
        const saleDate = new Date(sale.createOn);
        return saleDate >= startOfDay && saleDate <= endOfDay;
      })
      .reduce((acc, sale) => {
        return acc + sale.items.reduce((itemAcc: number, item: any) => {
          return itemAcc + (item.quantity * item.sellingPrice);
        }, 0);
      }, 0);
  }
 
  calculateSalesForTheWeek(sales: any[]) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() + 6));
 
    this.salesForTheWeek = sales
      .filter(sale => {
        const saleDate = new Date(sale.createOn);
        return saleDate >= startOfWeek && saleDate <= endOfWeek;
      })
      .reduce((acc, sale) => {
        return acc + sale.items.reduce((itemAcc: number, item: any) => {
          return itemAcc + (item.quantity * item.sellingPrice);
        }, 0);
      }, 0);
  }
 
  calculateSalesForTheMonth(sales: any[]) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
 
    this.salesForTheMonth = sales
      .filter(sale => {
        const saleDate = new Date(sale.createOn);
        return saleDate >= startOfMonth && saleDate <= endOfMonth;
      })
      .reduce((acc, sale) => {
        return acc + sale.items.reduce((itemAcc: number, item: any) => {
          return itemAcc + (item.quantity * item.sellingPrice);
        }, 0);
      }, 0);
  }

  getTop10ProductsForToday(sales: any[]) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createOn);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    const productQuantities = this.aggregateProductQuantities(todaySales);
    const top10Products = this.getTop10Products(productQuantities);
    this.top10Sales4Today = top10Products;
  }

  getTop10ProductsForTheWeek(sales: any[]) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() + 6));

    const weekSales = sales.filter(sale => {
      const saleDate = new Date(sale.createOn);
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    });

    const productQuantities = this.aggregateProductQuantities(weekSales);
    const top10Products = this.getTop10Products(productQuantities);
    this.top10Sales4TheWeek = top10Products
  }

  getTop10ProductsForTheMonth(sales: any[]) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.createOn);
      return saleDate >= startOfMonth && saleDate <= endOfMonth;
    });

    const productQuantities = this.aggregateProductQuantities(monthSales);
    const top10Products = this.getTop10Products(productQuantities);
    this.top10Sales4TheMonth = top10Products
  }

  aggregateProductQuantities(sales: any[]): { [key: string]: { quantity: number, category: string } } {
    const productQuantities: { [key: string]: { quantity: number, category: string } } = {};
  
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        if (productQuantities[item.itemName]) {
          productQuantities[item.itemName].quantity += item.quantity;
        } else {
          productQuantities[item.itemName] = {
            quantity: item.quantity,
            category: item.category // Include the category
          };
        }
      });
    });
  
    return productQuantities;
  }

  getTop10Products(productQuantities: { [key: string]: { quantity: number, category: string } }): { itemName: string, quantity: number, category: string }[] {
    return Object.entries(productQuantities)
      .map(([itemName, { quantity, category }]) => ({ itemName, quantity, category }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }


  getSalesOverviewForTheDay(sales: any[]): { category: string, totalSales: number }[] {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
   
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createOn);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });
  
    // Aggregate sales by category
    const salesByCategory: { [key: string]: number } = {};
  
    todaySales.forEach(sale => {
      sale.items.forEach((item: any) => {
        if (salesByCategory[item.category]) {
          salesByCategory[item.category] += item.sellingPrice * item.quantity;
        } else {
          salesByCategory[item.category] = item.sellingPrice * item.quantity;
        }
      });
    });
  
    // Convert to an array of objects
    return Object.entries(salesByCategory)
      .map(([category, totalSales]) => ({ category, totalSales }));
  }


  fetchDebtors() {
    const headers = this.getAuthHeaders();
    let debtors: any [] =  [];
    this.http.get(`${this.baseurl.url}get-debtors`, { headers })
      .subscribe({
        next: (response: any) => {
          debtors = response.debtors; // Store the fetched debtors
          // Calculate totalDebts
          this.totalDebts = debtors.reduce((total: number, debtor: any) => {
            return total + (debtor.amountDue || 0); // Ensure debtAmount is a number
          }, 0);
        },
        error: (error) => {
          console.error('Error fetching debtors:', error);
          //alert('An error occurred while fetching debtors.');
        }
      });
  }

  fetchExpenses(startDate: Date, endDate: Date) {
    // Format dates as YYYY-MM-DD
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    let expenses: any [] = [];
  
    // Make the API call to fetch expenses
    this.http.get(`${this.baseurl.url}get-expenses?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (response: any) => {
          // Format the createdAt timestamp for each expense
          expenses = response.expenses.map((expense: any) => ({
            ...expense,
            createdAt: this.formatFirestoreTimestamp(expense.createdAt)
          }));
          
          // Calculate total expenses
          this.totalExpenses = expenses.reduce((sum: number, expense: any) => 
            sum + (expense.amount || 0), 0
          );
        },
        error: (error) => {
          console.error('Error fetching expenses:', error);
        }
      });
  }
  

  
  private formatFirestoreTimestamp(timestamp: { _seconds: number, _nanoseconds: number }): string {
    const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
      // Helper method to get first day of current month
  getStartOfMonth(): Date {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
      }
      
      // Helper method to get last day of current month
  getEndOfMonth(): Date {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      }
  

getCurrentMonth(): string {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }



  getTotalMonthlyPurchases() {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
      const headers = this.getAuthHeaders();
      const params = { startDate: startOfMonth, endDate: endOfMonth };
  
      return this.http.get(this.baseurl.url + "purchases", { headers, params })
        .subscribe({
          next: (res: any) => {
            if (res.success && res.data) {
              // Calculate total purchases amount
              const totalAmount = res.data.reduce((total: number, purchase: any) =>
                total + (purchase.quantity * purchase.costPrice), 0
              );
  
              // Calculate total items purchased
              const totalItems = res.data.reduce((total: number, purchase: any) =>
                total + purchase.quantity, 0
              );
  
              // Set the monthlyPurchases to the total amount
              this.monthlyPurchases = totalAmount;
  
              return {
                totalAmount,
                totalItems,
                purchaseCount: res.data.length
              };
            }
            
            // If no data, set monthlyPurchases to 0
            this.monthlyPurchases = 0;
            return { totalAmount: 0, totalItems: 0, purchaseCount: 0 };
          },
          error: (error) => {
            console.error('Error fetching monthly purchases:', error);
            
            // If error, set monthlyPurchases to 0
            this.monthlyPurchases = 0;
            return { totalAmount: 0, totalItems: 0, purchaseCount: 0 };
          }
        });
  }

}
