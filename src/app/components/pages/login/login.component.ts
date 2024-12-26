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
      console.error("Email or password is missing.");
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
            console.log('Login successful:', response);
            this.router.navigate(["storemanager"]);
          } else {
            console.error("Missing token in response");
          }
          this.login.email = "";
          this.login.password = "";
        },
        (error) => {
          // Handle login error
          console.error('Login failed:', error);
          if (error.error) {
            console.error(error.error.message); // Log specific error message from backend
          }
          // Display error message to user (e.g., using a toast notification)
        }
      );
  }
  
}
