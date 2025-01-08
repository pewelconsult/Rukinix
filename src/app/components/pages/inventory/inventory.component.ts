import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../../../interfaces/classes/Products';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import * as XLSX from 'xlsx';
import { NgClass } from '@angular/common';
import { Categorysummary } from '../../../interfaces/categorysummary';
import { firstValueFrom } from 'rxjs';


declare var bootstrap: any; // Declare Bootstrap for accessing its modal API.


@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [SidebarComponent, FormsModule, NgClass],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit{

  async ngOnInit(): Promise<void> {
    try {
      await this.loadAllData();
      await this.getAllProducts()
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

   categorySummaries: Categorysummary[] = [];


  searchTerm: string = '';
  filteredProducts: any[] = [];

   private baseurl = new BaseUrl()

   CategoryData:any={
    name:""
   }

   http = inject(HttpClient)
   allcategories: any[] = [];
   allproducts: any[] = [];
   product: Product = new Product();
   isLoading: boolean = true; 
   totalItems: number = 0;
   totalCost: number = 0;
   totalRevenue: number = 0;
   totalCategories: number = 0;
   lowStockItems: any[] = [];
   totalLowStocks: number = 0;
   editProduct: any = {};
   selectedProduct : any = {};
 
    

   private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // or get from auth service
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  
  formatCurrency(value: number): string {
    return value.toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Helper function to parse currency string back to number
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/,/g, ''));
  }


  private async loadAllData(): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([
        this.getAllCategories(),
        this.loadProducts()
      ]);
      this.calculateCategorySummaries();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadProducts(): Promise<void> {
    const headers = this.getAuthHeaders();
    try {
      const response: any = await firstValueFrom(
        this.http.get(this.baseurl.url + "products", { headers })
      );
      this.allproducts = this.sortProducts(response.data);
      this.filteredProducts = this.allproducts;
      this.updateTotals();
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  }


  
   onAddCategory() {
    const headers = this.getAuthHeaders();
    const categoryData = {
      category: this.CategoryData.name
    }
    this.http.post(this.baseurl.url + "add-category", categoryData, { headers }).subscribe((res:any)=> {
      alert(this.CategoryData.name + " Category added successfully")
      this.CategoryData.name=""
      this.getAllCategories()
    })
   }


   onAddProduct() {
    const headers = this.getAuthHeaders();
    const productsData = this.product;
    
    this.http.post(this.baseurl.url + "add-products", productsData, {headers}).subscribe({
        next: (res: any) => {
            this.product = new Product();
            alert("Product added successfully");
            this.getAllProducts();
        },
        error: (error) => {
            alert("Error occured, check and try again")
        }
    });
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

// Add search method
onSearch(event: any) {
  const term = event.target.value.toLowerCase();
  this.filteredProducts = this.allproducts.filter(product => 
    product.itemName.toLowerCase().includes(term) ||
    product.itemCode.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term) ||
    product.brand.toLowerCase().includes(term)
  );
}


getAllCategories() {
  const headers = this.getAuthHeaders();
  this.http.get(this.baseurl.url + "categories", { headers }).subscribe((res: any) => {
      this.allcategories = res.data;

      // Sort the categories by categoryName
      this.allcategories.sort((a: any, b: any) => {
          if (a.categoryName < b.categoryName) return -1;
          if (a.categoryName > b.categoryName) return 1;
          return 0;
      });
      this.totalCategories = this.allcategories.length;
  });
}



getAllProducts() {
  const headers = this.getAuthHeaders();
  this.isLoading = true;
  this.http.get(this.baseurl.url+"products", {headers}).subscribe({
    next: (res:any)=> {
      this.allproducts = this.sortProducts(res.data);
      this.totalItems = this.allproducts.length;
      this.filteredProducts = this.allproducts;
      this.calculateTotals();
      this.calculateLowStocks();
      this.isLoading = false;
    },
    error: (error) => {
      this.isLoading = false;
    }
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



calculateCategorySummaries(): Categorysummary[] {
  // Create a map to group products by category
  const categoryMap = new Map<string, any[]>();
  
  // Group products by category
  this.allproducts.forEach(product => {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, []);
    }
    categoryMap.get(product.category)?.push(product);
  });

  // Convert map to array of CategorySummary objects
  this.categorySummaries = Array.from(categoryMap.entries()).map(([categoryName, products]) => {
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = products.reduce((sum, product) => sum + (product.sellingPrice * product.quantity), 0);
    const lowStockCount = products.filter(product => product.quantity <= product.reorderLevel).length;

    return {
      categoryName,
      totalQuantity,
      totalValue,
      productCount: products.length,
      lowStockCount,
      products: products
    };
  });

  // Sort by category name
  this.categorySummaries.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  return this.categorySummaries;
}



   exportToExcel(): void {
    const exportData = this.allproducts.map(product => ({
      'Item Name': product.itemName,
      'SKU': product.itemCode,
      'Category': product.category,
      'Brand': product.brand,
      'Stock': product.quantity,
      'Cost Price (GHC)': product.costPrice,
      'Selling Price (GHC)': product.sellingPrice,
      'Size': product.size
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    const fileName = `inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }


  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      const headers = this.getAuthHeaders();
      
      this.http.delete(`${this.baseurl.url}delete-product/${productId}`, { headers })
        .subscribe({
          next: (res: any) => {
            // Update local data instead of fetching all products again
            this.filteredProducts = this.filteredProducts.filter(product => product.id !== productId);
            
            // Update low stock items if needed
            this.lowStockItems = this.lowStockItems.filter(product => product.id !== productId);
            
            // Update totals
            this.totalItems = this.filteredProducts.length;
            this.updateTotals(); // Create this method to recalculate other totals
            
            alert('Product deleted successfully');
          },
          error: (error) => {
            alert('Failed to delete product. Please try again.');
          }
        });
    }
}

// Add this method to recalculate totals
private updateTotals() {
    this.totalLowStocks = this.filteredProducts.filter(p => p.quantity <= p.reorderLevel).length;
    this.totalRevenue = this.filteredProducts.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
    this.totalCost = this.filteredProducts.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);
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
  

  onEdit(product: any) {
    this.selectedProduct = product;
  }
  
  onUpdateProduct() {
    const selectedProductData = this.selectedProduct;
    const productId = selectedProductData.id;
    const headers = this.getAuthHeaders();
    
    this.http.put(`${this.baseurl.url}update-product/${productId}`, selectedProductData, {headers})
      .subscribe({
        next: (res: any) => {
          // Update the product in the main products list
          const index = this.filteredProducts.findIndex(p => p.id === productId);
          if (index !== -1) {
            this.filteredProducts[index] = { ...selectedProductData };
          }

          // Update the product in low stock items if it exists there
          const lowStockIndex = this.lowStockItems.findIndex(p => p.id === productId);
          if (lowStockIndex !== -1) {
            // Remove from low stock if quantity is now above reorder level
            if (selectedProductData.quantity > selectedProductData.reorderLevel) {
              this.lowStockItems.splice(lowStockIndex, 1);
            } else {
              this.lowStockItems[lowStockIndex] = { ...selectedProductData };
            }
          } else if (selectedProductData.quantity <= selectedProductData.reorderLevel) {
            // Add to low stock if quantity is now below reorder level
            this.lowStockItems.push({ ...selectedProductData });
          }

          // Update totals
          this.updateTotals();

          // Reset selected product
          this.selectedProduct = new Product();

          // Close modal
          const modalElement = document.getElementById('editItemModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }

          alert('Product updated successfully!');
        },
        error: (error) => {
          alert('An error occurred while updating the product. Please try again.');
        }
      });
}



}



