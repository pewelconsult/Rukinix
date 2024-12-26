import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../interfaces/classes/RegisterUser'
import { CommonModule } from '@angular/common';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  http = inject(HttpClient);
  private router = inject(Router)
  register: User = new User();
  private baseurl = new BaseUrl()
  
  // Move these to be class properties
  showPassword = false;
  showConfirmPassword = false;


  onRegister(form: NgForm) {
    // Log the registration data
    const registrationData = {
      ...this.register,
      confirmPassword: undefined 
    };
    
    console.log('Registration Data:', registrationData);
    this.http.post(this.baseurl.url + "register", registrationData).subscribe((res:any)=> {
      console.log(res)
      this.register = new User()
      this.router.navigate(['login'])
    })
  }
}