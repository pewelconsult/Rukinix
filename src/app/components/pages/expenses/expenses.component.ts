import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ExpenseForm } from '../../../interfaces/classes/Expense';
import { FormsModule } from '@angular/forms';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent implements OnInit{
  ngOnInit(): void {
    this.fetchExpenses(this.getStartOfMonth(), this.getEndOfMonth());
  }

  totalExpenses: number = 0;
  expense = new ExpenseForm()
  baseurl = new BaseUrl()
  http = inject(HttpClient)
  expenses: any[] = [];

   private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token'); // or get from auth service
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
  
    onAddExpense() {
      const expenseData = { ...this.expense }; 
      this.http.post(`${this.baseurl.url}add-expense`, expenseData, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            alert("Expense added successfully")
            this.expense = new ExpenseForm(); // Reset the form
            this.fetchExpenses(this.getStartOfMonth(), this.getEndOfMonth());
          },
          error: (error) => {
            console.error('Error adding expense:', error);
          }
        });
    }


    private formatFirestoreTimestamp(timestamp: { _seconds: number, _nanoseconds: number }): string {
      const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }


    private formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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
  
    // Method to fetch expenses between specified start and end dates
fetchExpenses(startDate: Date, endDate: Date) {
  // Format dates as YYYY-MM-DD
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  // Make the API call to fetch expenses
  this.http.get(`${this.baseurl.url}get-expenses?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, { headers: this.getAuthHeaders() })
    .subscribe({
      next: (response: any) => {
        // Format the createdAt timestamp for each expense
        this.expenses = response.expenses.map((expense: any) => ({
          ...expense,
          createdAt: this.formatFirestoreTimestamp(expense.createdAt)
        }));
        
        // Calculate total expenses
        this.totalExpenses = this.expenses.reduce((sum: number, expense: any) => 
          sum + (expense.amount || 0), 0
        );
      },
      error: (error) => {
        console.error('Error fetching expenses:', error);
      }
    });
}

    
    // Helper method to get first day of current month
    getStartOfMonth(): Date {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    
    // Helper method to get last day of current month
    getEndOfMonth(): Date {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    



}
