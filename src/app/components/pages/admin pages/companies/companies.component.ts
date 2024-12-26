import { Component, inject, OnInit } from '@angular/core';
import { AdminsidebarComponent } from '../adminsidebar/adminsidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseUrl } from '../../../../interfaces/classes/BaseUrl';
import { CompanyForm } from '../../../../interfaces/classes/CompanyData';
import { Company } from '../../../../interfaces/company';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [AdminsidebarComponent, FormsModule, CommonModule],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent implements OnInit {
  ngOnInit(): void {
    this.getAllCompanies()
  }

  logoPreview: string | null = null;
  logoFile: File | null = null;

  private http = inject(HttpClient)
  private baseurl = new BaseUrl()
  company: CompanyForm = new CompanyForm();
  companies: Company[] = [];
  isLoading = true
  imageBaseUrl = this.baseurl.url.slice(0, -1);  
  selectedCompany: Company = {
    id: ''
  };
  updateLogoPreview: string | null = null;



  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should not exceed 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      this.logoFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  onAddCompany(): void {
    // Prepare form data to send
    const formData = new FormData();
    if (this.logoFile) {
      formData.append('companyLogo', this.logoFile, this.logoFile.name);
    }
    formData.append('companyName', this.company.companyName);
    formData.append('contactPersonName', this.company.contactPersonName);
    formData.append('contactPersonPhone', this.company.contactPersonPhone);
    formData.append('companyEmail', this.company.companyEmail);
    formData.append('subscriptionPlan', this.company.subscriptionPlan);
    formData.append('address', this.company.address);

    // Send the POST request
    this.http.post(`${this.baseurl.url}add-company`, formData).subscribe(
      (res: any) => {
        alert('Company added successfully!');
        this.company = new CompanyForm(); // Reset the form
        this.logoFile = null; // Clear the file input
        this.logoPreview = null; // Clear the logo preview
        this.getAllCompanies(); // Refresh the company list if applicable
      },
      (error) => {
        console.error('Error adding company:', error);
        alert('An error occurred while adding the company. Please try again.');
      }
    );
  }


  getAllCompanies() {
    this.isLoading = true
    this.http.get(this.baseurl.url + "companies").subscribe((res:any)=> {
      this.companies = res
      console.log(this.companies)
      this.isLoading = false
    })
  }

  onEdit(company: Company) {
    this.selectedCompany = { ...company };
  }

  onUpdateCompany() {
    const selectedCompanyData = { ...this.selectedCompany };
    console.log(selectedCompanyData)
    this.http.post(`${this.baseurl.url}update-company`, selectedCompanyData).subscribe(
      (res: any) => {
        alert('Company added successfully!');
        this.getAllCompanies(); 
      },
      (error) => {
        console.error('Error adding company:', error);
        alert('An error occurred while adding the company. Please try again.');
      }
    );
  }


  onUpdateLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.updateLogoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  

  onDelete(companyId: string) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      this.http.delete(`${this.baseurl.url}delete-company/${companyId}`).subscribe({
        next: (response) => {
          // Remove company from local array to update UI immediately
          this.companies = this.companies.filter(company => company.id !== companyId);
          alert('Company deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          alert('Failed to delete company. Please try again.');
        }
      });
    }
  }


}
