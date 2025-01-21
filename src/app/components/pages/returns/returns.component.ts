import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../../../interfaces/classes/Products';
import { ProcessedSale, Sale } from '../../../interfaces/sales';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.css'
})
export class ReturnsComponent implements OnInit {
  mainSales: Sale[] = [];
  baseurl = new BaseUrl();
  private http = inject(HttpClient);
  allproducts: any[] = [];
  processedSales: ProcessedSale[] = [];
  product: Product = new Product();
  selectedSale: ProcessedSale | null = null;
  newQuantity: number = 0;
  private currentModal: any = null;

  ngOnInit(): void {
    this.getAllSales(this.processedSales);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllSales(arrey: ProcessedSale[]) {
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url + "sales", { headers }).subscribe({
      next: (res: any) => {
        this.mainSales = res.data.sales;
        const processed = this.mainSales.map(sale => 
          sale.items.map(item => ({
            productCode: item.id,
            productName: item.itemName,
            customerName: sale.customerName,
            quantity: item.quantity,
            totalAmount: item.sellingPrice * item.quantity,
            paymentMode: sale.paymentMode,
            date: new Date(sale.createOn).toLocaleDateString(),
            createdBy: sale.createdBy,
            saleId: sale.id,
            sellingPrice: item.sellingPrice
          }))
        ).flat();

        arrey.length = 0;
        arrey.push(...processed);
      },
      error: (error) => {
        console.log('Failed to fetch sales data');
      }
    });
  }

  openModal(sale: ProcessedSale) {
    this.selectedSale = sale;
    this.newQuantity = 1; // Start with 1 instead of full quantity
    const modal = document.getElementById('returnModal');
  
    if (modal) {
      modal.style.zIndex = '1050'; // Ensure it's on top
      try {
        this.currentModal = new bootstrap.Modal(modal);
        this.currentModal.show();
      } catch (error) {
        console.error('Error initializing modal:', error);
      }
    } else {
      console.error('Modal element not found');
    }
  }
  

  validateReturn(): string | null {
    if (!this.selectedSale) return 'No sale selected';
    if (this.newQuantity <= 0) return 'Quantity must be greater than 0';
    if (this.newQuantity > this.selectedSale.quantity) {
      return `Cannot return more than original quantity (${this.selectedSale.quantity})`;
    }
    return null;
  }

  confirmReturn() {
    const error = this.validateReturn();
    if (error) {
      console.log(error);
      return;
    }

    if (this.selectedSale) {
      const returnData = {
        saleId: this.selectedSale.saleId,
        productCode: this.selectedSale.productCode,
        quantity: this.newQuantity,
        returnAmount: this.newQuantity * this.selectedSale.sellingPrice
      };

      const headers = this.getAuthHeaders();
      
      this.http.post(this.baseurl.url + "returns", returnData, { headers }).subscribe({
        next: (response: any) => {
          //alert('Return processed successfully');
          this.getAllSales(this.processedSales); // Refresh the sales list
          this.closeModal();
        },
        error: (error) => {
          console.log('Failed to process return: ' + (error.message || 'Unknown error'));
        }
      });
    }
  }

  closeModal() {
    if (this.currentModal) {
      this.currentModal.hide();
      this.currentModal = null;
    }
    this.selectedSale = null;
    this.newQuantity = 0;
  }
}