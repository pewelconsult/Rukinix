import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  checkoutForm!: FormGroup;
  cartItems: any[] = [];
  paymentMethods = ['Cash', 'Mobile Money', 'Credit'];
  selectedPaymentMethod: string = 'Cash';
  isProcessing: boolean = false;
  changeDue: number = 0;
  Math = Math

  constructor(private fb: FormBuilder) {
    // Initialize with some sample cart items
    this.cartItems = [
      { id: 1, itemName: 'Product 1', quantity: 2, sellingPrice: 100 },
      { id: 2, itemName: 'Product 2', quantity: 1, sellingPrice: 150 }
    ];
  }

  ngOnInit() {
    this.checkoutForm = this.fb.group({
      customerName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.email]],
      notes: ['']
    });
  }

  calculateSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.03; // 3% tax
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isProcessing = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Order submitted:', {
          ...this.checkoutForm.value,
          paymentMethod: this.selectedPaymentMethod,
          items: this.cartItems,
          total: this.calculateTotal()
        });
        this.isProcessing = false;
        // Add success handling
      }, 1500);
    }
  }
}
