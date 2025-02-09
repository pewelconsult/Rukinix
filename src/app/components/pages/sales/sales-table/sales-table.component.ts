import { Component, inject, Input, OnInit } from '@angular/core';
import { ProcessedSale } from '../../../../interfaces/sales';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../../interfaces/classes/BaseUrl';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

interface PaymentSummary {
  mode: string;
  amount: number;
}


@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sales-table.component.html',
  styleUrl: './sales-table.component.css'
})
export class SalesTableComponent implements OnInit {
  @Input() processedSales: ProcessedSale[] = [];
  private http = inject(HttpClient);
  baseurl = new BaseUrl();
  selectedSaleItem: ProcessedSale | null = null;
  private modalInstance: any;

  ngOnInit(): void {
    this.logProcessSale();
    this.initializeModal();
  }

  private initializeModal(): void {
    const modalElement = document.getElementById('editSaleModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
    }
  }

  logProcessSale() {
    
  }

  onDeleteSale(saleId: string, productId: string) {
    const isConfirmed = window.confirm('Are you sure you want to delete this item?');
    if (isConfirmed) {
      const headers = this.getAuthHeaders();
      this.http.delete(`${this.baseurl.url}delete-sale/${saleId}/${productId}`, { headers }).subscribe({
        next: () => {
          alert('Item deleted successfully');
          // Refresh the sales list or remove the item from the array
          this.processedSales = this.processedSales.filter(sale => 
            sale.saleId !== saleId && sale.productCode !== productId
          );
        },
        error: (error) => {
          alert('Failed to delete item');
          console.error('Delete error:', error);
        }
      });
    }
  }

  onEditSale(sale: ProcessedSale) {
    this.selectedSaleItem = { ...sale };
    if (this.modalInstance) {
      this.modalInstance.show();
    } else {
      // Reinitialize if modal instance doesn't exist
      this.initializeModal();
      this.modalInstance?.show();
    }
  }

  saveSaleEdit() {
    if (!this.selectedSaleItem) return;

    const headers = this.getAuthHeaders();
    const payload = {
      saleId: this.selectedSaleItem.saleId,
      productId: this.selectedSaleItem.productCode,
      newPrice: this.selectedSaleItem.sellingPrice,
      quantity: this.selectedSaleItem.quantity
    };

    this.http.put(`${this.baseurl.url}edit-sale`, payload, { headers }).subscribe({
      next: (response) => {
        this.modalInstance?.hide();
        // Update the local data instead of reloading the page
        const index = this.processedSales.findIndex(sale => 
          sale.saleId === this.selectedSaleItem?.saleId
        );
        if (index !== -1 && this.selectedSaleItem) {
          this.processedSales[index] = {
            ...this.processedSales[index],
            ...this.selectedSaleItem
          };
        }
        alert('Sale updated successfully');
      },
      error: (error) => {
        alert('Failed to update sale');
        console.error('Update error:', error);
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  addCommas(value: number | string | null): string {
    if (value === null || value === undefined) {
      return '0';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      return '0';
    }
    return numericValue.toLocaleString();
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  isAdmin(): boolean {
    const userRole = this.getUserRole();
    return userRole === 'Admin' || userRole === 'Manager';
  }

  isMainAdmin(): boolean {
    const userRole = this.getUserRole();
    return userRole === 'Admin';
  }

  calculateTotalQuantity(): number {
    return this.processedSales.reduce((total, sale) => total + (sale.quantity || 0), 0);
  }

  calculateTotalAmount(): number {
    return this.processedSales.reduce((total, sale) => total + (sale.totalAmount || 0), 0);
  }

  getPaymentModeSummary(): PaymentSummary[] {
    const summaryMap = new Map<string, number>();
    
    // Calculate totals for each payment mode
    this.processedSales.forEach(sale => {
      const currentAmount = summaryMap.get(sale.paymentMode) || 0;
      summaryMap.set(sale.paymentMode, currentAmount + (sale.totalAmount || 0));
    });

    // Convert the map to an array of PaymentSummary objects
    return Array.from(summaryMap.entries()).map(([mode, amount]) => ({
      mode,
      amount
    }));
  }
}