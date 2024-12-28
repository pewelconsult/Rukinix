import { Component, inject } from '@angular/core';
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
        alert('Error fetching company');
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
    // Check if item already exists in cart
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // If item exists, increment quantity
      existingItem.quantity += 1;
    } else {
      // If item doesn't exist, add it with quantity 1
      this.cartItems.push({
        id: product.id,
        itemName: product.itemName,
        sellingPrice: product.sellingPrice,
        quantity: 1
      });
    }
    
    this.calculateTotal();
  }

  calculateTotal() {
    const res =  this.cartItems.reduce((total, item) => 
      total + (item.sellingPrice * item.quantity), 0
    );
    this.amount2BePaid=res
    return res
  }

  // Add method to remove item from cart
  removeFromCart(itemId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  // Add methods to update quantity
  updateQuantity(itemId: number, change: number) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      item.quantity = Math.max(0, item.quantity + change);
      if (item.quantity === 0) {
        this.removeFromCart(itemId);
      }
    }
  }

  calculateChange(): number {
    return this.amountPaid - this.calculateTotal();
  }



  makeSale(): void {
    if (this.isProcessing) return;
    this.receiptNumber = 'INV-' + `INV-${uuidv4()}`;
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
        // Show the receipt modal
        this.getCompanyByName()
       const receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'), {});
       receiptModal.show();
      },
      error: (error) => {
        alert('Failed to process sale. Please try again.');
        this.isProcessing = false;
      }
    });
  }

  private resetCart(): void {
    this.cartItems = [];
    this.amountPaid = 0;
    this.customerName = '';
    this.paymentMode = '';
  }


  printReceipt(): void {
    const printContent = document.getElementById('receiptContent');
    const WindowPrt = window.open('', '', 'width=900,height=650');
    if (WindowPrt && printContent) {
      WindowPrt.document.write(printContent.innerHTML);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
      this.resetCart();
    }
  }




}


