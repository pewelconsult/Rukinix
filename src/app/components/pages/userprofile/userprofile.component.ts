import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../../interfaces/classes/User';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent implements OnInit{
  ngOnInit(): void {
    this.getUser()
  }

  baseurl = new BaseUrl();
  private http = inject(HttpClient)
  user: User = new User()

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token'); // or get from auth service
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    

  getUser() {
    const headers = this.getAuthHeaders();
    this.http.get(this.baseurl.url + "user", { headers }).subscribe((res: any) => {
        console.log(res)
        this.user = res
    });
  }
}
