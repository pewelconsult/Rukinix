import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private router = inject(Router)
  private http = inject(HttpClient)
  private baseurl = new BaseUrl()
 
  login = {
    email:'',
    password:''
  }


  onLogin() {
    if (!this.login.email || !this.login.password) {
      alert("Email or password is missing.");
      return;
    }
  
    const loginData = {
      email: this.login.email,
      password: this.login.password,
    };
  
    this.http.post<any>(this.baseurl.url + 'login', loginData)
      .subscribe(
        (response) => {
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('token_expiry', response.token_expiry);
            localStorage.setItem('user_role', response.userRole);
            localStorage.setItem('company_name', response.companyName);
            if (response.userRole === 'Manager') {
              this.router.navigate(["storemanager"]);
            }else if (response.userRole === 'Admin') {
              this.router.navigate(["admin"]);
            } else {
              this.router.navigate(["pointofsale"]);
            }
            
          } else {
            console.log("An error occured, check and try again");
          }
          this.login.email = "";
          this.login.password = "";
        },
        (error) => {
          // Handle login error
          console.log("Error occured, check and try again")
          if (error.error) {
            console.log("Error occured, check and try again") // Log specific error message from backend
          }
          // Display error message to user (e.g., using a toast notification)
        }
      );
  }
  
}
