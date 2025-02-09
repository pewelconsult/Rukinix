// liabilities.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

export class LiabilityData {
  id?: number;
  liabilityName: string = '';
  amount: number = 0;
  supplyDate: string = '';
  dueDate: string = '';
  notes: string = '';
  contactNumber: string = '';
  status?: string;
  amountPaid?: number;
}

@Component({
  selector: 'app-liabilities',
  standalone: true,
  imports: [
    SidebarComponent, 
    FormsModule, 
    CommonModule,
    DatePipe
  ],
  templateUrl: './liabilities.component.html',
  styleUrl: './liabilities.component.css'
})
export class LiabilitiesComponent implements OnInit {
  ngOnInit(): void {
    this.fetchLiabilities();
  }

  liability: LiabilityData = new LiabilityData();
  private baseurl = new BaseUrl();
  private http = inject(HttpClient);
  liabilities: any[] = [];
  totalLiabilities = 0;
  overdueLiabilities = 0;
  dueThisMonth = 0;
  selectedLiability: LiabilityData = new LiabilityData();
  paymentAmount: number = 0;

  validateLiability(liability: LiabilityData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!liability.liabilityName || liability.liabilityName.trim() === '') {
      errors.push('Liability name is required');
    }

    if (liability.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!liability.dueDate) {
      errors.push('Due date is required');
    } else {
      const dueDate = new Date(liability.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date format');
      }
    }

    if (!liability.contactNumber || liability.contactNumber.trim() === '') {
      errors.push('Contact number is required');
    } else {
      const phoneRegex = /^\d{10,}$/;
      if (!phoneRegex.test(liability.contactNumber.replace(/\D/g, ''))) {
        errors.push('Invalid contact number format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  onSaveLiability() {
    const liabilityFormData = { ...this.liability };
    const validation = this.validateLiability(liabilityFormData);

    if (!validation.isValid) {
      const errorMessage = validation.errors.join('\n');
      alert('Information not complete:\n' + errorMessage);
      return;
    }

    const headers = this.getAuthHeaders();

    this.http.post(`${this.baseurl.url}add-liability`, liabilityFormData, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Liability saved successfully!');
          this.liability = new LiabilityData();
          this.fetchLiabilities();
          // Close modal
          const modal = document.getElementById('addLiabilityModal');
          if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }
        },
        error: (error) => {
          console.error('Error saving liability:', error);
          alert('An error occurred while saving the liability.');
        }
      });
  }

  fetchLiabilities() {
    const headers = this.getAuthHeaders();

    this.http.get(`${this.baseurl.url}get-liabilities`, { headers })
      .subscribe({
        next: (response: any) => {
          this.liabilities = response.liabilities;
          this.calculateMetrics();
        },
        error: (error) => {
          console.error('Error fetching liabilities:', error);
          console.log('An error occurred while fetching liabilities.');
        }
      });
  }

  calculateMetrics() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    this.totalLiabilities = this.liabilities.reduce((total: number, liability: any) => {
      return total + (liability.amount || 0);
    }, 0);

    this.overdueLiabilities = this.liabilities
      .filter(liability => new Date(liability.dueDate) < currentDate)
      .reduce((total: number, liability: any) => total + (liability.amount || 0), 0);

    this.dueThisMonth = this.liabilities
      .filter(liability => {
        const dueDate = new Date(liability.dueDate);
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
      })
      .reduce((total: number, liability: any) => total + (liability.amount || 0), 0);
  }

  openPaymentModal(liability: any) {
    this.selectedLiability = liability;
    this.paymentAmount = 0;
  }

  onPaymentSubmit() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.selectedLiability.amount) {
      alert('Invalid payment amount. Please enter a value between 0 and ' + this.selectedLiability.amount);
      return;
    }

    const updatedLiability = {
      ...this.selectedLiability,
      amountPaid: (this.selectedLiability.amountPaid || 0) + this.paymentAmount,
      amount: this.selectedLiability.amount - this.paymentAmount
    };

    const headers = this.getAuthHeaders();
    this.http.post(`${this.baseurl.url}update-liability`, updatedLiability, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Payment submitted successfully!');
          this.fetchLiabilities();
          // Close modal
          const modal = document.getElementById('paymentModal');
          if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }
        },
        error: (error) => {
          console.error('Error submitting payment:', error);
          alert('An error occurred while submitting the payment.');
        }
      });
  }

  sendReminder(id: number) {
    const headers = this.getAuthHeaders();
    this.http.post(`${this.baseurl.url}send-liability-reminder/${id}`, {}, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Reminder sent successfully!');
        },
        error: (error) => {
          console.error('Error sending reminder:', error);
          alert('An error occurred while sending the reminder.');
        }
      });
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

}