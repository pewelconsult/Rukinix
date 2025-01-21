import { Component, inject, Input } from '@angular/core';
import { ProcessedSale } from '../../../../interfaces/sales';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../../interfaces/classes/BaseUrl';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [],
  templateUrl: './sales-table.component.html',
  styleUrl: './sales-table.component.css'
})
export class SalesTableComponent {
  @Input() processedSales: ProcessedSale[] = [];
  private http = inject(HttpClient)
  baseurl = new BaseUrl()

  
  
//Delete a sale
onDeleteSale(saleId: string, productId: string) {
  const isConfirmed = window.confirm('Are you sure you want to delete this item?');
  if (isConfirmed) {
    const headers = this.getAuthHeaders();
    this.http.delete(`${this.baseurl.url}delete-sale/${saleId}/${productId}`, { headers }).subscribe({
      next: () => {
        alert('Item deleted successfully');
      },
      error: (error) => {
        alert('Failed to delete item');
        console.error(error);
      }
    });
  }
}

  // Helper function to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  
  addCommas(value: number | string | null): string {
    //console.log(this.processedSales)
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


}
