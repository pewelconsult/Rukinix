import { Component, inject } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DebotorDataToSend } from '../../../interfaces/classes/debtors';
import { FormsModule } from '@angular/forms';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './debtors.component.html',
  styleUrl: './debtors.component.css'
})
export class DebtorsComponent {

  debtor:DebotorDataToSend = new DebotorDataToSend()
  private baseurl = new BaseUrl()
  private http = inject(HttpClient)


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


  onSaveDebtor() {
    const debtorFormData = { ...this.debtor };
    const validation = this.validateDebtor(debtorFormData);
    if (!validation.isValid) {
      // Join all error messages with line breaks
      const errorMessage = validation.errors.join('\n');
      alert('Information not complete:\n' + errorMessage);
      return;
    }

    // Proceed with saving the debtor
    console.log('Valid debtor data:', debtorFormData);
    // Add your save logic here
  }
  

}
