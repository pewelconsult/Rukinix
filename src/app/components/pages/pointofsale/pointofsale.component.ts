import { Component, inject } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ProductService } from '../../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';


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
  amount2BePaid: number = 0

  ngOnInit(): void {
    this.getAllProducts()
    console.log(this.Array(this.placeholderCount))
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
        console.error('Error fetching products:', error);
        this.isLoading = false; // Don't forget to handle errors
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

    const saleData = {
      items: this.cartItems,
      total: this.calculateTotal(),
      amountPaid: this.amountPaid,
      change: this.calculateChange(),
      paymentMode: this.paymentMode,
      customerName: this.customerName
    };

    this.isProcessing = true;
    const headers = this.getAuthHeaders();

    this.http.post(this.baseurl.url + "make-sales", saleData, { headers }).subscribe({
      next: (response: any) => {
        alert('Sale completed successfully');
        this.resetCart();
        this.isProcessing = false;

        // Optionally print receipt or perform other post-sale actions
        if (response?.saleId) {
          this.printReceipt(response.saleId);
        }
      },
      error: (error) => {
        console.error('Error processing sale:', error);
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

  private printReceipt(saleId: string): void {
    console.log('Printing receipt for sale:', saleId);
  }

}
