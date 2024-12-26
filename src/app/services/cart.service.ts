import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Product } from '../interfaces/product';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(product: any): void {
    const currentCart = this.cartItems.getValue();
    const existingItem = currentCart.find(item => item.id === product.id);

    if (existingItem) {
      this.updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      this.cartItems.next([...currentCart, { ...product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cartItems.getValue();
    this.cartItems.next(currentCart.filter(item => item.id !== productId));
  }

  updateQuantity(productId: number, newQuantity: number): void {
    const currentCart = this.cartItems.getValue();
    if (newQuantity === 0) {
      this.removeFromCart(productId);
    } else {
      this.cartItems.next(
        currentCart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  }

  calculateTotal(): number {
    const currentCart = this.cartItems.getValue();
    return Number(currentCart.reduce((total, item) => 
      total + (item.price * item.quantity), 0).toFixed(2));
  }
}
