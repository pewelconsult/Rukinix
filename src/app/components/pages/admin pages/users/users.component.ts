import { Component, inject, OnInit } from '@angular/core';
import { AdminsidebarComponent } from '../adminsidebar/adminsidebar.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Company } from '../../../../interfaces/company';
import { BaseUrl } from '../../../../interfaces/classes/BaseUrl';
import { HttpClient } from '@angular/common/http';
import { CreateUserDto, User } from '../../../../interfaces/users';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [AdminsidebarComponent, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent  implements OnInit{
  userForm!: FormGroup; 
  showPassword = false;
  showConfirmPassword = false;
  companies: Company [] = [];
  baseurl = new BaseUrl();
  http = inject(HttpClient)
  users: User[] = [];
  loading = false
  isLoading = false
 

  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.getAllUsers()
    this.getAllCompanies()

    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dateOfBirth: ['', Validators.required],
      role: ['', Validators.required],
      company: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }




  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


onSubmit() {
    this.loading = true;
    const userData: CreateUserDto = {
        fullName: this.userForm.get('fullName')?.value,
        email: this.userForm.get('email')?.value,
        phoneNumber: this.userForm.get('phoneNumber')?.value,
        dateOfBirth: this.userForm.get('dateOfBirth')?.value,
        role: this.userForm.get('role')?.value,
        company: this.userForm.get('company')?.value,
        password: this.userForm.get('password')?.value
    };

    console.log('Sending data:', userData);

    this.http.post<User>(this.baseurl.url + 'register', userData)
        .subscribe({
            next: (response: User) => {
                console.log('Success:', response);
                this.loading = false; // Changed from true to false
                alert('User registered successfully');
                this.userForm.reset();
                this.getAllUsers()
            },
            error: (error) => {
                console.error('Error details:', error);
                this.loading = false;
                
                if (error.status === 409) {
                    alert('Email already registered');
                } else if (error.status === 400) {
                    alert(error.error.error || 'Invalid data provided');
                } else if (error.status === 500) {
                    alert('Server error. Please try again later');
                } else {
                    alert('An error occurred: ' + (error.error?.error || error.message));
                }
            }
        });
}

getAllUsers() {
  this.isLoading = true
    this.http.get<User[]>(this.baseurl.url + 'users')
        .subscribe({
            next: (response: any) => {
                this.users = response.data;
                console.log(this.users)
                this.isLoading = false
            },
            error: (error) => {
                console.error('Error fetching users:', error);
            }
        });
}

   
getAllCompanies() {
    this.http.get(this.baseurl.url + "companies").subscribe((res:any)=> {
      this.companies = res
    })
  }





}
