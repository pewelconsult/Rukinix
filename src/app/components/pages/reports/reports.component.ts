import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { ReportDataToSend } from '../../../interfaces/classes/ReportData';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import * as XLSX from 'xlsx';


interface FormattedSale {
  date: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
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
  
    onGenerateReport() {
      // Check if any field is empty
      if (!this.report.startDate || !this.report.endDate || !this.report.reportType) {
        alert('All parts of the form must be filled');
        return;
      }
      const startDate = new Date(this.report.startDate);
      const endDate = new Date(this.report.endDate);
      if (endDate < startDate) {
        alert('End date cannot be earlier or equal to start date');
        return;
      }

      const reportData = {...this.report}
      if (this.report.reportType === 'Sales Report') {
        this.getAllSales(reportData.startDate, reportData.endDate)
      } else if (this.report.reportType === "Inventory Report") {
        this.getAllProducts()
      } else {
        //console.log("Supplier report")
      }{
        
      }
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



    downloadReport() {
      let data: any[] = [];
      let fileName = '';
  
      // Determine which report is active and set up data accordingly
      if (this.report.reportType === 'Sales Report' && this.formattedSales.length > 0) {
        data = this.formattedSales;
        fileName = 'sales_report.xlsx';
      } else if (this.report.reportType === 'Inventory Report' && this.allproducts.length > 0) {
        data = this.allproducts.map(item => ({
          'Product Name': item.itemName,
          'Cost Price': item.costPrice,
          'Quantity': item.quantity,
          'Re-Order Level': item.reorderLevel,
          'Selling Price': item.sellingPrice,
          'Category': item.category
        }));
        fileName = 'inventory_report.xlsx';
      } else {
        console.log('No data available to download');
        return;
      }
  
      // Create worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      
      // Create workbook
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
  
      // Save file
      XLSX.writeFile(wb, fileName);
    }

// Add to the component class
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
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h2>${title}</h2>
            <p>${dateRange}</p>
          </div>
    `;
 
    if (this.report.reportType === 'Sales Report') {
      printContent += this.getSalesPrintTemplate();
    } else if (this.report.reportType === 'Inventory Report') {
      printContent += this.getInventoryPrintTemplate();
    }
 
    printContent += `
        </body>
      </html>
    `;
 
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
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

}
