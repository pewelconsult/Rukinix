import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ProductService } from '../../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

declare var bootstrap: any; // Declare Bootstrap for accessing its modal API.

@Component({
  selector: 'app-pointofsale',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './pointofsale.component.html',
  styleUrl: './pointofsale.component.css'
})

export class PointofsaleComponent {

  searchTerm = '';
  products: any[] = [];
  cartItems: any[] = [];
  productservice = inject(ProductService)
  private baseurl = new BaseUrl()
  private http = inject(HttpClient)
  isLoading = true;
  placeholderCount: number = 0;
  Array = Array;
  amountPaid: number = 0;
  paymentMode: string = '';
  customerName: string = ""
  isProcessing = false;
  amount2BePaid: number = 0;
  receiptNumber = "";
  currentDate = new Date();
  companyName = localStorage.getItem('company_name');
  companyAddress = ""
  companyPhone = ""

  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.getAllProducts()
  }

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token'); // or get from auth service
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    

  getAllProducts() {
    this.isLoading = true; // Set loading to true before fetching
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url+"products", {headers}).subscribe({
      next: (res: any) => {
        this.products = res.data;
        this.placeholderCount = this.products.length;
        this.isLoading = false; // Set loading to false after data arrives
      },
      error: (error) => {
        this.isLoading = false; // Don't forget to handle errors
      }
    });
  }


  getCompanyByName() {
    const name = localStorage.getItem('company_name')
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url + "companies/name/" + name, {headers}).subscribe({
      next: (res: any) => {
        const data = res;
        this.companyAddress = data.address
        this.companyPhone = data.contactPersonPhone
      },
      error: (error) => {
        console.log('Error fetching company');
        this.isLoading = false;
      }
    });
}


  get filteredProducts() {
    return this.products.filter(product => 
      product.itemName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

 
  addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        id: product.id,
        itemName: product.itemName,
        sellingPrice: product.sellingPrice,
        quantity: 1,
        category: product.category
      });
    }
    
    this.updateCartTotals();
  }

  
  private updateCartTotals() {
    const total = this.calculateTotal();
    this.amount2BePaid = total;
    this.amountPaid = total;
    this.cdr.detectChanges();
  }


  calculateTotal() {
    return this.cartItems.reduce((total, item) => 
      total + (item.sellingPrice * item.quantity), 0
    );
  }

  // Modified removeFromCart method
  removeFromCart(itemId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.updateCartTotals();
  }

  // Add methods to update quantity
  updateQuantity(itemId: number, change: number) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      item.quantity = Math.max(0, item.quantity + change);
      if (item.quantity === 0) {
        this.removeFromCart(itemId);
      } else {
        this.updateCartTotals();
      }
    }
  }

  // Modified updatePrice method
  updatePrice(itemId: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const newPrice = parseFloat(target.value);
    
    if (!isNaN(newPrice)) {
      const item = this.cartItems.find(item => item.id === itemId);
      if (item) {
        item.sellingPrice = Math.max(0, newPrice);
        this.updateCartTotals();
      }
    }
  }

  calculateChange(): number {
    return this.amountPaid - this.amount2BePaid;
  }



  makeSale(): void {
    if (this.isProcessing) return;
    this.receiptNumber = `${uuidv4()}`;
    const saleData = {
      items: this.cartItems,
      total: this.calculateTotal(),
      amountPaid: this.amountPaid,
      change: this.calculateChange(),
      paymentMode: this.paymentMode,
      customerName: this.customerName,
      receiptNumber: this.receiptNumber
    };

    this.isProcessing = true;
    const headers = this.getAuthHeaders();
    saleData.receiptNumber = this.receiptNumber
    this.http.post(this.baseurl.url + "make-sales", saleData, { headers }).subscribe({
      next: (response: any) => {
        alert('Sale completed successfully');
        this.isProcessing = false;
        this.getAllProducts()
        // Show the receipt modal
        this.getCompanyByName()
       const receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'), {});
       receiptModal.show();
      },
      error: (error) => {
        console.log('Failed to process sale. Please try again.');
        this.isProcessing = false;
      }
    });
  }

   resetCart(): void {
    this.cartItems = [];
    this.amountPaid = 0;
    this.customerName = '';
    this.paymentMode = '';
  }


  printReceipt(): void {
    const printContent = document.getElementById('receiptContent');
    const originalStyles = document.getElementsByTagName('style');
    const cssLinks = document.getElementsByTagName('link');
    
    const WindowPrt = window.open('', '', 'width=250,height=auto');
    
    if (WindowPrt && printContent) {
      WindowPrt.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Receipt</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
      `);
  
      // Copy stylesheets and styles as before
      for (let i = 0; i < cssLinks.length; i++) {
        if (cssLinks[i].rel === 'stylesheet') {
          WindowPrt.document.write(cssLinks[i].outerHTML);
        }
      }
  
      for (let i = 0; i < originalStyles.length; i++) {
        WindowPrt.document.write(originalStyles[i].outerHTML);
      }
  
      WindowPrt.document.write(`
        <style>
          @page {
            margin: 0;
            padding: 0;
            size: 72mm auto;
          }
          
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            background: white;
          }
          
          #receiptContent {
            width: 90%;
            max-width: none;
            margin: 0 auto;
            padding: 0 6mm;
            background: white;
            font-family: 'Courier New', monospace;
            font-size: 13px; /* Consistent font size */
            line-height: 1.3; /* Consistent line height */
            box-sizing: border-box;
          }
          
          .receipt-items {
            width: 100%;
            padding: 0 2mm;
          }
          
          /* Modified item row to allow wrapping */
          .item-row {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr auto auto auto;
            gap: 4px;
            margin: 2px 0;
            padding: 0 1mm;
            font-weight: bold; /* Bold font for items */
          }
          
          /* Header row stays on one line */
          .item-header {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr auto auto auto;
            gap: 4px;
            margin: 2px 0;
            padding: 0 1mm;
            white-space: nowrap;
            font-weight: bold; /* Bold font for headers */
          }
          
          /* Allow item name to wrap */
          .item-name {
            padding-right: 6px;
            white-space: normal;
            word-wrap: break-word;
            min-width: 0;
          }
          
          .item-qty {
            width: 35px;
            text-align: right;
            padding-right: 6px;
          }
          
          .item-price {
            width: 50px;
            text-align: right;
            padding-right: 6px;
          }
          
          .item-total {
            width: 50px;
            text-align: right;
          }
          
          .receipt-divider {
            width: 100%;
            overflow: hidden;
            padding: 0 2mm;
            font-weight: bold; /* Bold font for dividers */
          }
          
          .total-row {
            width: 100%;
            display: flex;
            justify-content: space-between;
            padding: 0 2mm;
            margin: 1px 0;
            font-weight: bold; /* Bold font for totals */
          }
          
          .receipt-header {
            text-align: center;
            padding: 0 2mm;
          }
          
          .receipt-footer {
            text-align: center;
            padding: 0 2mm;
            font-weight: bold; /* Bold font for footer */
          }
          
          @media print {
            * {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            #receiptContent {
              width: 90%;
              margin: 0 auto;
              padding: 0 6mm;
            }
          }
        </style>
      `);
  
      WindowPrt.document.write('</head><body>');
      
      WindowPrt.document.write(`
        <div id="receiptContent">
          ${printContent.innerHTML}
        </div>
      `);
      
      WindowPrt.document.write('</body></html>');
      WindowPrt.document.close();
      
      WindowPrt.onload = () => {
        WindowPrt.focus();
        
        WindowPrt.onafterprint = () => {
          this.resetCart();
          WindowPrt.close();
        };
  
        WindowPrt.onbeforeunload = () => {
          WindowPrt.onafterprint = null;
        };
  
        setTimeout(() => {
          WindowPrt.print();
        }, 300);
      };
    }
  }


}


