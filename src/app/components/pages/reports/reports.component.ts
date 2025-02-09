import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { ReportDataToSend } from '../../../interfaces/classes/ReportData';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import * as XLSX from 'xlsx';
import { firstValueFrom } from 'rxjs';
import { NgClass } from '@angular/common';


interface FormattedSale {
  date: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

// Add these interfaces to your component
interface FormattedExpense {
  date: string;
  category: string;
  description: string;
  amount: number;
  item: string;
}

interface FormattedPurchase {
  date: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalAmount: number;
  supplierName: string;
}

interface ExpenseCategory {
  category: string;
  items: FormattedExpense[];
  subtotal: number;
}

interface ProfitLossStatement {
  sales: number;
  purchases: number;
  expensesByCategory: ExpenseCategory[];
  totalExpenses: number;
  netProfit: number;
}


type ExpenseCategoryType = 'Asset' | 'Salaries' | 'Utilities' | 'Rent' | 
                          'Transportation' | 'Maintenance' | 'Office Supplies' | 'Other';

// Define the categories object with proper typing
const EXPENSE_CATEGORIES: Record<ExpenseCategoryType, string> = {
  'Asset': 'Asset',
  'Salaries': 'Salaries',
  'Utilities': 'Utilities',
  'Rent': 'Rent',
  'Transportation': 'Transportation',
  'Maintenance': 'Maintenance',
  'Office Supplies': 'Office Supplies',
  'Other': 'Other'
};



@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [SidebarComponent, FormsModule, NgClass],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})

export class ReportsComponent implements OnInit{
  ngOnInit(): void {
    //this.getAllProducts()
  }

    report: ReportDataToSend = new ReportDataToSend()
    http = inject(HttpClient)
    baseurl = new BaseUrl()
    formattedSales: FormattedSale[] = [];
    lowStockItems: any[] = [];
   totalLowStocks: number = 0;
   allproducts: any[] = [];
  filteredProducts: any[] = [];
  totalItems = 0;
  totalCost = 0;
  totalRevenue = 0;
  
  formattedExpenses: FormattedExpense[] = [];
  formattedPurchases: FormattedPurchase[] = [];
  profitLossData: ProfitLossStatement = {
  sales: 0,
  purchases: 0,
  expensesByCategory: [],
  totalExpenses: 0,
  netProfit: 0
};



onGenerateReport() {
  if (!this.report.startDate || !this.report.endDate || !this.report.reportType) {
    alert('All parts of the form must be filled');
    return;
  }

  const startDate = new Date(this.report.startDate);
  const endDate = new Date(this.report.endDate);
  
  if (endDate < startDate) {
    alert('End date cannot be earlier than start date');
    return;
  }

  // Add one day to end date for inclusive results
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

  // Format dates as strings in YYYY-MM-DD format
  const formattedStartDate = this.report.startDate;
  const formattedEndDate = adjustedEndDate.toISOString().split('T')[0];

  // Reset previous data
  this.formattedSales = [];
  this.formattedExpenses = [];
  this.formattedPurchases = [];

  switch(this.report.reportType) {
    case 'Sales Report':
      this.getAllSales(formattedStartDate, formattedEndDate);
      break;
    case 'Expenses Report':
      this.getExpenses(formattedStartDate, formattedEndDate);
      break;
    case 'Purchases Report':
      this.getPurchases(this.report.startDate, this.report.endDate);
      break;
    case 'Profit or Loss':
      this.generateProfitLossReport(formattedStartDate, formattedEndDate);
      break;
    case 'Inventory Report':
      this.getAllProducts();
      break;
  }
}




    // In your component class
calculateSalesTotals() {
  const totalQuantity = this.formattedSales.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = this.formattedSales.reduce((sum, item) => sum + item.totalAmount, 0);
  return { totalQuantity, totalAmount };
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
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      }
      


      getAllProducts() {
        const headers = this.getAuthHeaders();
        this.http.get(this.baseurl.url+"products", {headers}).subscribe((res:any)=> {
          this.allproducts = res.data;
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
      




      getAllSales(startDate: string, endDate: string) {
        const headers = this.getAuthHeaders();
        const params = { startDate, endDate };
        this.http.get(this.baseurl.url + "sales", { headers, params }).subscribe({
            next: (res: any) => {
                if (res.success && res.data.sales) {
                    res.data.sales.forEach((sale: any) => {
                        sale.items.forEach((item: any) => {
                            this.formattedSales.push({
                                date: new Date(sale.createOn).toLocaleDateString(),
                                customerName: sale.customerName,
                                productName: item.itemName,
                                quantity: item.quantity,
                                unitPrice: item.sellingPrice,
                                totalAmount: item.quantity * item.sellingPrice
                            });
                        });
                    });
                }
            }
        });
    }


 
 private getSalesPrintTemplate(): string {
  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Customer Name</th>
          <th>Date</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${this.formattedSales.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.customerName}</td>
            <td>${item.date}</td>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice.toFixed(2)}</td>
            <td>${item.totalAmount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
 }
 
 private getInventoryPrintTemplate(): string {
  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product Name</th>
          <th>Cost Price</th>
          <th>Quantity</th>
          <th>Re-Order Level</th>
          <th>Selling Price</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        ${this.allproducts.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.itemName}</td>
            <td>${item.costPrice}</td>
            <td>${item.quantity}</td>
            <td>${item.reorderLevel}</td>
            <td>${item.sellingPrice}</td>
            <td>${item.category}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
 }


 formatFirebaseDate(timestamp: any): string {
  try {
    // Check if it's a Firebase Timestamp object with _seconds
    if (timestamp && timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // If it's a regular date string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return 'Invalid Date';
  } catch (error) {
    console.error('Date formatting error:', error, 'for timestamp:');
    return 'Invalid Date';
  }
}



getExpenses(startDate: string, endDate: string) {
  const headers = this.getAuthHeaders();
  const params = { startDate, endDate };
  
  this.http.get(this.baseurl.url + "get-expenses", { headers, params })
    .subscribe({
      next: (res: any) => {
        if (res.success && res.expenses) {
          this.formattedExpenses = res.expenses.map((expense: any) => ({
            date: this.formatFirebaseDate(expense.createdAt),
            category: expense.category,
            description: expense.item || '',
            amount: expense.amount
          }));

          // Sort by date (newest first)
          this.formattedExpenses.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        }
      },
      error: (error) => {
        console.error('Error fetching expenses:', error);
      }
    });
}


getPurchases(startDate: string, endDate: string) {
  const headers = this.getAuthHeaders();
  const params = { startDate, endDate };
  
  this.http.get(this.baseurl.url + "purchases", { headers, params })
    .subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.formattedPurchases = res.data
            .filter((purchase: any) => {
              const purchaseDate = new Date(purchase.purchaseDate);
              return purchaseDate >= new Date(startDate) && 
                     purchaseDate <= new Date(endDate);
            })
            .map((purchase: any) => ({
              date: new Date(purchase.purchaseDate).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }),
              productName: purchase.productName,
              quantity: purchase.quantity,
              costPrice: purchase.costPrice,
              totalAmount: purchase.quantity * purchase.costPrice,
              supplierName: purchase.supplierName || 'N/A'
            }));

          // Sort by date (newest first)
          this.formattedPurchases.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          
        }
      },
      error: (error) => {
        console.error('Error fetching purchases:', error);
      }
    });
}


generateProfitLossReport(startDate: string, endDate: string) {
  const headers = this.getAuthHeaders();
  const params = { startDate, endDate };

  Promise.all([
    firstValueFrom(this.http.get(this.baseurl.url + "sales", { headers, params })),
    firstValueFrom(this.http.get(this.baseurl.url + "purchases", { headers, params })),
    firstValueFrom(this.http.get(this.baseurl.url + "get-expenses", { headers, params }))
  ]).then(([salesRes, purchasesRes, expensesRes]: any[]) => {
    // Calculate total sales
    const totalSales = salesRes.data.sales.reduce((total: number, sale: any) => {
      return total + sale.items.reduce((itemTotal: number, item: any) => {
        return itemTotal + (item.quantity * item.sellingPrice);
      }, 0);
    }, 0);

    // Calculate total purchases
    const totalPurchases = purchasesRes.data ? purchasesRes.data.reduce((total: number, purchase: any) => {
      return total + (purchase.quantity * purchase.costPrice);
    }, 0) : 0;

    // Group expenses by category and include all categories
    const expenses = expensesRes.expenses || [];
    const expensesByCategory = Object.entries(
      expenses.reduce((acc: any, expense: any) => {
        const category = expense.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = {
            items: [],
            subtotal: 0
          };
        }
        const formattedItem = {
          date: this.formatFirebaseDate(expense.createdAt),
          description: expense.item,
          amount: expense.amount
        };
        acc[category].items.push(formattedItem);
        acc[category].subtotal += expense.amount;
        return acc;
      }, {})
    ).map(([category, data]: [string, any]) => ({
      category,
      items: data.items,
      subtotal: data.subtotal
    }));

    const totalExpenses = expensesByCategory.reduce((total, cat) => total + cat.subtotal, 0);

    this.profitLossData = {
      sales: totalSales,
      purchases: totalPurchases,
      expensesByCategory: expensesByCategory,
      totalExpenses: totalExpenses,
      netProfit: totalSales - totalPurchases - totalExpenses
    };
  }).catch(error => {
    console.error('Error generating profit/loss report:', error);
  });
}



private groupExpensesByCategory(expenses: any[]): ExpenseCategory[] {
  // First, initialize all categories with empty arrays
  const groupedExpenses = Object.keys(EXPENSE_CATEGORIES).reduce((acc, category) => {
    acc[category as ExpenseCategoryType] = [];
    return acc;
  }, {} as Record<ExpenseCategoryType, any[]>);

  // Then group expenses by category
  expenses.forEach(expense => {
    // Check if the category exists in our predefined categories
    const category = expense.category as ExpenseCategoryType;
    const targetCategory = (EXPENSE_CATEGORIES.hasOwnProperty(category) ? 
      category : 'Other') as ExpenseCategoryType;

    if (!groupedExpenses[targetCategory]) {
      groupedExpenses[targetCategory] = [];
    }

    groupedExpenses[targetCategory].push({
      date: this.formatFirebaseDate(expense.createdAt),
      description: expense.item,
      amount: expense.amount
    });
  });

  // Convert grouped expenses to array format with subtotals
  return Object.entries(groupedExpenses)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({
      category,
      items,
      subtotal: items.reduce((total, item) => total + item.amount, 0)
    }))
    .sort((a, b) => b.subtotal - a.subtotal); // Sort by subtotal in descending order
}


calculateExpensesTotal(): number {
  return this.formattedExpenses.reduce((total, expense) => total + expense.amount, 0);
}

calculatePurchasesTotal(): number {
  return this.formattedPurchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
}


calculatePurchasesTotals() {
  return {
    totalQuantity: this.formattedPurchases.reduce((total, purchase) => total + purchase.quantity, 0),
    totalAmount: this.formattedPurchases.reduce((total, purchase) => 
      total + (purchase.costPrice * purchase.quantity), 0)
  };
}




downloadReport() {
  let data: any[] = [];
  let fileName = '';

  switch(this.report.reportType) {
    case 'Sales Report':
      if (this.formattedSales.length > 0) {
        data = this.formattedSales;
        fileName = 'sales_report.xlsx';
      }
      break;

    case 'Expenses Report':
      if (this.formattedExpenses.length > 0) {
        data = this.formattedExpenses.map(expense => ({
          'Date': expense.date,
          'Category': expense.category,
          'Item': expense.description,
          'Amount': expense.amount
        }));
        fileName = 'expenses_report.xlsx';
      }
      break;

    case 'Purchases Report':
      if (this.formattedPurchases.length > 0) {
        data = this.formattedPurchases.map(purchase => ({
          'Date': purchase.date,
          'Product Name': purchase.productName,
          'Quantity': purchase.quantity,
          'Unit Cost': purchase.costPrice,
          'Total Amount': purchase.costPrice * purchase.quantity,
          'Supplier': purchase.supplierName || 'N/A'
        }));
        fileName = 'purchases_report.xlsx';
      }
      break;

    case 'Profit or Loss':
      if (this.profitLossData) {
        data = [
          { Category: 'Revenue', Item: 'Total Sales', Amount: this.profitLossData.sales },
          { Category: 'Costs', Item: 'Total Purchases', Amount: this.profitLossData.purchases },
          { Category: '', Item: '', Amount: '' }, // Empty row for spacing
          { Category: 'Expenses', Item: 'Expenses Breakdown', Amount: '' }
        ];

        // Add expenses by category
        this.profitLossData.expensesByCategory.forEach(category => {
          data.push({ 
            Category: category.category, 
            Item: 'Subtotal', 
            Amount: category.subtotal 
          });
          // Add individual items
          category.items.forEach(item => {
            data.push({ 
              Category: '', 
              Item: item.description, 
              Amount: item.amount 
            });
          });
        });

        // Add final totals
        data.push(
          { Category: '', Item: '', Amount: '' },
          { Category: 'Total Expenses', Item: '', Amount: this.profitLossData.totalExpenses },
          { Category: 'Net Profit/Loss', Item: '', Amount: this.profitLossData.netProfit }
        );
        fileName = 'profit_loss_statement.xlsx';
      }
      break;
  }

  if (data.length > 0) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, fileName);
  } else {
    console.log('No data available to download');
  }
}

printReport() {
  let printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    let title = this.report.reportType;
    let dateRange = `${this.report.startDate} to ${this.report.endDate}`;
    
    let printContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { margin: 1cm; }
            .report-header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .category-header { background-color: #f8f9fa; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f5f5f5; }
            .expense-category { margin: 10px 0; }
            .expense-item { padding: 5px 0; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h2>${title}</h2>
            <p>${dateRange}</p>
          </div>
    `;

    switch(this.report.reportType) {
      case 'Sales Report':
        printContent += this.getSalesPrintTemplate();
        break;
      case 'Expenses Report':
        printContent += this.getExpensesPrintTemplate();
        break;
      case 'Purchases Report':
        printContent += this.getPurchasesPrintTemplate();
        break;
      case 'Profit or Loss':
        printContent += this.getProfitLossPrintTemplate();
        break;
    }

    printContent += `</body></html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}

// Add these helper methods for printing
private getExpensesPrintTemplate(): string {
  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Category</th>
          <th>Item</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${this.formattedExpenses.map((expense, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>GHC ${this.addCommas(expense.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="4">Total Expenses</td>
          <td>GHC ${this.addCommas(this.calculateExpensesTotal())}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

private getPurchasesPrintTemplate(): string {
  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Unit Cost</th>
          <th>Total Amount</th>
          <th>Supplier</th>
        </tr>
      </thead>
      <tbody>
        ${this.formattedPurchases.map((purchase, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${purchase.date}</td>
            <td>${purchase.productName}</td>
            <td>${purchase.quantity}</td>
            <td>GHC ${this.addCommas(purchase.costPrice)}</td>
            <td>GHC ${this.addCommas(purchase.costPrice * purchase.quantity)}</td>
            <td>${purchase.supplierName || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">Totals</td>
          <td>${this.calculatePurchasesTotals().totalQuantity}</td>
          <td></td>
          <td>GHC ${this.addCommas(this.calculatePurchasesTotals().totalAmount)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
}

private getProfitLossPrintTemplate(): string {
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 20px;">
        <h3>Revenue</h3>
        <div style="display: flex; justify-content: space-between; padding: 10px; background-color: #f8f9fa;">
          <span>Total Sales</span>
          <span>GHC ${this.addCommas(this.profitLossData.sales)}</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3>Costs</h3>
        <div style="display: flex; justify-content: space-between; padding: 10px; background-color: #f8f9fa;">
          <span>Total Purchases</span>
          <span>GHC ${this.addCommas(this.profitLossData.purchases)}</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3>Expenses by Category</h3>
        ${this.profitLossData.expensesByCategory.map(category => `
          <div class="expense-category">
            <div class="category-header" style="padding: 10px; background-color: #f8f9fa;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${category.category}</strong>
                <span>GHC ${this.addCommas(category.subtotal)}</span>
              </div>
            </div>
            ${category.items.map(item => `
              <div class="expense-item" style="padding: 5px 20px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>${item.date} - ${item.description}</span>
                  <span>GHC ${this.addCommas(item.amount)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa;">
        <div style="display: flex; justify-content: space-between;">
          <strong>Total Expenses</strong>
          <span>GHC ${this.addCommas(this.profitLossData.totalExpenses)}</span>
        </div>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: ${this.profitLossData.netProfit > 0 ? '#d4edda' : '#f8d7da'};">
        <div style="display: flex; justify-content: space-between;">
          <strong>Net Profit/Loss</strong>
          <span>GHC ${this.addCommas(this.profitLossData.netProfit)}</span>
        </div>
      </div>
    </div>
  `;
}

}
