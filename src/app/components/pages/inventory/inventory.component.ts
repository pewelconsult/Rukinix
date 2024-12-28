import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../../../interfaces/classes/Products';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import * as XLSX from 'xlsx';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [SidebarComponent, FormsModule, NgClass],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit{

   ngOnInit(): void {
    this.getAllCategories()
    this.getAllProducts()
   }

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
  const reve = this.formatCurrency(this.totalRevenue).toString();
  
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
    this.http.get(this.baseurl.url+"products", {headers}).subscribe((res:any)=> {
      this.allproducts = res.data;
      this.totalItems = this.allproducts.length
      this.filteredProducts = this.allproducts;
      this.calculateTotals();
      this.calculateLowStocks()
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
    })
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
            alert('Product deleted successfully');
            this.getAllProducts(); // Refresh the product list
          },
          error: (error) => {
            alert('Failed to delete product. Please try again.');
          }
        });
    }
  }


  addCommas(value: number | string): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      throw new Error('Input must be a valid number or numeric string');
    }
    // Format the number with commas
    return numericValue.toLocaleString();
  }
  

  onEdit(product: any) {
    this.selectedProduct = product;
  }
  
  onUpdateProduct() {
    const selectedProductData = this.selectedProduct;
    const productId = selectedProductData.id
    const headers = this.getAuthHeaders();
    
    this.http.put(`${this.baseurl.url}update-product/${productId}`, selectedProductData, {headers})
      .subscribe(
        (res: any) => {
          alert('Product updated successfully!');
          this.getAllProducts();
          this.selectedProduct = new Product();
        },
        (error) => {
          alert('An error occurred while updating the product. Please try again.');
        }
      );
  }

}



