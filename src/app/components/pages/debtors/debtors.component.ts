import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DebotorDataToSend } from '../../../interfaces/classes/debtors';
import { FormsModule } from '@angular/forms';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './debtors.component.html',
  styleUrl: './debtors.component.css'
})
export class DebtorsComponent implements OnInit {
  ngOnInit(): void {
    this.fetchDebtors()
  }

  debtor: DebotorDataToSend = new DebotorDataToSend(); // Initialize debtor object
  private baseurl = new BaseUrl(); // Base URL for API
  private http = inject(HttpClient); // Inject HttpClient
  debtors:any [] =  [];
  totalDebts=0;
  selectedDebtor: DebotorDataToSend = {
    debtorName: '',
    amountDue: 0,
    dateDue: '',
    contactNumber: '',
    notes: ''
  };
  paymentAmount: number = 0; 


  // Validate debtor data
  validateDebtor(debtor: DebotorDataToSend): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
  
    // Check debtor name
    if (!debtor.debtorName || debtor.debtorName.trim() === '') {
      errors.push('Debtor name is required');
    }
  
    // Check amount due
    if (debtor.amountDue <= 0) {
      errors.push('Amount due must be greater than 0');
    }
  
    // Check due date
    if (!debtor.dateDue) {
      errors.push('Due date is required');
    } else {
      const dueDate = new Date(debtor.dateDue);
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date format');
      }
    }
  
    // Check contact number
    if (!debtor.contactNumber || debtor.contactNumber.trim() === '') {
      errors.push('Contact number is required');
    } else {
      // Simple phone number validation (adjust regex based on your needs)
      const phoneRegex = /^\d{10,}$/;
      if (!phoneRegex.test(debtor.contactNumber.replace(/\D/g, ''))) {
        errors.push('Invalid contact number format');
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // or get from auth service
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  onSaveDebtor() {
    const debtorFormData = { ...this.debtor }; // Create a copy of the debtor object
    const validation = this.validateDebtor(debtorFormData); // Validate the data
  
    if (!validation.isValid) {
      // Join all error messages with line breaks
      const errorMessage = validation.errors.join('\n');
      alert('Information not complete:\n' + errorMessage);
      return;
    }
  
    // Proceed with saving the debtor
    const headers = this.getAuthHeaders();
  
    this.http.post(`${this.baseurl.url}add-debtor`, debtorFormData, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Debtor saved successfully!');
          this.debtor = new DebotorDataToSend(); // Reset the form
          this.fetchDebtors()
        },
        error: (error) => {
          console.error('Error saving debtor:', error);
          alert('An error occurred while saving the debtor.');
        }
      });
  }


  // Method to fetch all debtors
  // Method to fetch all debtors
fetchDebtors() {
  const headers = this.getAuthHeaders();

  this.http.get(`${this.baseurl.url}get-debtors`, { headers })
    .subscribe({
      next: (response: any) => {
        this.debtors = response.debtors; // Store the fetched debtors
        // Calculate totalDebts
        this.totalDebts = this.debtors.reduce((total: number, debtor: any) => {
          return total + (debtor.amountDue || 0); // Ensure debtAmount is a number
        }, 0);
      },
      error: (error) => {
        console.error('Error fetching debtors:', error);
        console.log('An error occurred while fetching debtors.');
      }
    });
}



  openPaymentModal(debtor: any) {
    this.selectedDebtor = debtor; // Set the selected debtor
    this.paymentAmount = 0; // Reset the payment amount
  }

  // Method to handle payment submission
  onPaymentSubmit() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.selectedDebtor.amountDue) {
      alert('Invalid payment amount. Please enter a value between 0 and ' + this.selectedDebtor.amountDue);
      return;
    }

    // Update the debtor's amountPaid and amountDue
    const updatedDebtor = {
      ...this.selectedDebtor,
      amountPaid: (this.selectedDebtor.amountPaid || 0) + this.paymentAmount,
      amountDue: this.selectedDebtor.amountDue - this.paymentAmount
    };

    // Send the updated debtor data to the backend
    const headers = this.getAuthHeaders();
    this.http.post(`${this.baseurl.url}update-debtor`, updatedDebtor, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Payment submitted successfully!');
          this.fetchDebtors(); // Refresh the debtors list
        },
        error: (error) => {
          console.error('Error submitting payment:', error);
          alert('An error occurred while submitting the payment.');
        }
      });

    // Close the modal
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
  }


}