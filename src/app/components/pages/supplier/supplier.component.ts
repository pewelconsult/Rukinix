import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Supplier } from '../../../interfaces/classes/Supplier';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent implements OnInit{
  ngOnInit(): void {
    this.getAllSuppliers()
  }
   supplier: Supplier = new Supplier()
   http = inject(HttpClient)
   baseurl = new BaseUrl()
   suppliers : Supplier[] = []
   totalSuppliers = 0

    private getAuthHeaders(): HttpHeaders {
         const token = localStorage.getItem('auth_token');
         return new HttpHeaders({
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         });
       }
       

       onSaveSupplier() {
        const headers = this.getAuthHeaders();
        const supplierFormData = {...this.supplier};
        
        this.http.post(this.baseurl.url + "add-supplier", supplierFormData, {headers})
            .subscribe({
                next: (response: any) => {
                    this.supplier =  new Supplier()
                    this.getAllSuppliers()
                    alert("Supplier added successfully!")
                },
                error: (error) => {
                    alert('Error adding supplier');
                }
            });
    }


    getAllSuppliers() {
      const headers = this.getAuthHeaders();
      this.http.get(this.baseurl.url + "suppliers", { headers })
          .subscribe({
              next: (response: any) => {
                  this.suppliers = response.data;
                  this.totalSuppliers = this.suppliers.length;
              },
              error: (error) => {
                  alert("Error occured")
              }
          });
  }


}
