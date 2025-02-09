import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { Product } from '../../../interfaces/classes/Products';
import { NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

declare var bootstrap: any; // Move this outside the component

interface StockPurchase {
  productId: string;
  productName: string;
  supplierName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  purchaseDate: string;
}

@Component({
  selector: 'app-stock-purchases',
  standalone: true,
  imports: [FormsModule, NgClass, SidebarComponent],
  templateUrl: './stock-purchases.component.html',
  styleUrl: './stock-purchases.component.css'
})
export class StockPurchasesComponent implements OnInit {
  private http = inject(HttpClient);
  private baseurl = new BaseUrl();

  // Properties
  monthlyPurchases: any[] = [];
  searchTerm: string = '';
  allproducts: any[] = [];
  filteredProducts: any[] = [];
  allcategories: any[] = [];
  selectedProduct: any = null;
  isLoading: boolean = false;

  // Forms
  stockPurchase: StockPurchase = {
    productId: '',
    productName:'',
    supplierName: '',
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  };

  newProduct: Product = new Product();

  async ngOnInit(): Promise<void> {
    try {
      await this.loadAllData();
      this.loadMonthlyPurchases(); 
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async loadAllData(): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([
        this.getAllCategories(),
        this.getAllProducts()
      ]);
    } finally {
      this.isLoading = false;
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  async getAllProducts() {
    const headers = this.getAuthHeaders();
    try {
      const response: any = await firstValueFrom(
        this.http.get(this.baseurl.url + "products", { headers })
      );
      this.allproducts = this.sortProducts(response.data);
      this.filteredProducts = this.allproducts;
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  getAllCategories() {
    const headers = this.getAuthHeaders();
    return firstValueFrom(
      this.http.get(this.baseurl.url + "categories", { headers })
    ).then((res: any) => {
      this.allcategories = res.data.sort((a: any, b: any) => 
        a.categoryName.localeCompare(b.categoryName)
      );
    });
  }

  private sortProducts(products: any[]): any[] {
    return [...products].sort((a, b) => {
      const categoryComparison = a.category.localeCompare(b.category);
      if (categoryComparison === 0) {
        return a.brand.localeCompare(b.brand);
      }
      return categoryComparison;
    });
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredProducts = this.allproducts.filter(product => 
      product.itemName.toLowerCase().includes(term) ||
      product.itemCode.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term)
    );
  }

  onAddStock(product: any) {
    this.selectedProduct = product;
    this.stockPurchase = {
      productId: product.id,
      productName: product.itemName,
      supplierName: product.supplierName,
      quantity: 0,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      purchaseDate: new Date().toISOString().split('T')[0]
    };

    
    // Fix for Bootstrap Modal
    const modalElement = document.getElementById('addStockModal');
    if (modalElement) {
      // Check if there's an existing modal instance
      let modalInstance = bootstrap.Modal.getInstance(modalElement);
      
      // If no instance exists, create a new one
      if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement, {
          keyboard: false,
          backdrop: 'static'
        });
      }
      
      modalInstance.show();
    }
  }

  savePurchase() {
    if (!this.selectedProduct || !this.stockPurchase) return;

    const headers = this.getAuthHeaders();
    const purchaseData = {
      ...this.stockPurchase,
      productId: this.selectedProduct.id,
      productName: this.selectedProduct.itemName
    };

    this.http.post(`${this.baseurl.url}add-purchase`, purchaseData, { headers })
      .subscribe({
        next: (response: any) => {
          // Update the product quantity in the local list
          const productIndex = this.filteredProducts.findIndex(p => p.id === this.selectedProduct.id);
          if (productIndex !== -1) {
            this.filteredProducts[productIndex].quantity += this.stockPurchase.quantity;
          }
          this.loadMonthlyPurchases();
          // Close modal
          const modalElement = document.getElementById('addStockModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }

          // Reset form
          this.stockPurchase = {
            productId: '',
            productName:'',
            supplierName: '',
            quantity: 0,
            costPrice: 0,
            sellingPrice: 0,
            purchaseDate: new Date().toISOString().split('T')[0]
          };
          
          alert('Stock purchase added successfully!');
        },
        error: (error) => {
          console.error('Error adding purchase:', error);
          alert('Failed to add stock purchase. Please try again.');
        }
      });
  }

saveDataToPurchase(data: any){

}


saveNewProduct() {
  const headers = this.getAuthHeaders();
  
  // First, add the product
  this.http.post(this.baseurl.url + "add-products", this.newProduct, { headers })
    .subscribe({
      next: (response: any) => {
  
        const productId = response.data.id;

        // After product is added, create a purchase record if quantity > 0
        if (this.newProduct.quantity > 0) {
          const purchaseData: StockPurchase = {
            productId: productId,
            productName: this.newProduct.itemName, // Make sure itemName is used
            supplierName: this.newProduct.supplierName, // Default supplier name for new products
            quantity: this.newProduct.quantity,
            costPrice: this.newProduct.costPrice,
            sellingPrice: this.newProduct.sellingPrice,
            purchaseDate: new Date().toISOString().split('T')[0]
          };
        

          // Add the purchase record
          this.http.post(`${this.baseurl.url}add-purchase`, purchaseData, { headers })
            .subscribe({
              next: (purchaseResponse) => {
                this.finalizeProductAddition(response.data);
                this.loadMonthlyPurchases();
              },
              error: (error) => {
                console.error('Error creating purchase record:', error);
                alert('Product added but failed to record initial stock.');
                this.finalizeProductAddition(response.data);
              }
            });
        } else {
          this.finalizeProductAddition(response.data);
        }
      },
      error: (error) => {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
      }
    });
}

private finalizeProductAddition(productData: any) {
  // Add the new product to the local list
  this.allproducts.push(productData);
  this.filteredProducts = this.sortProducts(this.allproducts);
  
  // Close modal
  const modalElement = document.getElementById('newProductModal');
  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  // Reset form
  this.newProduct = new Product();
  
  alert('Product added successfully!');
  
  // Refresh the products list
  this.getAllProducts();
}

async loadMonthlyPurchases() {
  const headers = this.getAuthHeaders();
  try {
    const response: any = await firstValueFrom(
      this.http.get(`${this.baseurl.url}purchases`, { headers })
    );

    if (response.success) {
      // Filter purchases for current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      this.monthlyPurchases = response.data.filter((purchase: any) => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate.getMonth() === currentMonth && 
               purchaseDate.getFullYear() === currentYear;
      });

      // Sort by date, most recent first
      this.monthlyPurchases.sort((a, b) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );
    }
  } catch (error) {
    console.error('Error loading purchases:', error);
  }
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


calculateMonthlyTotal(): number {
  return this.monthlyPurchases.reduce((total, purchase) => {
    return total + (purchase.costPrice * purchase.quantity);
  }, 0);
}

getCurrentMonth(): string {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
}
}