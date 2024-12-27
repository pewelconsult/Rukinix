import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule], // Added RouterLinkActive
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  ngOnInit(): void {
    this.setCompanyName()
  }
  isSidebarOpen = false;
  activeLink = 'dashboard';
  companyName:string = ''

 

  private router = inject(Router)

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveLink(link: string) {
    this.activeLink = link;
  }

  isActive(link: string): boolean {
    return this.activeLink === link;
  }

  // Optional: method to close sidebar on mobile after link click
  handleLinkClick() {
    if (window.innerWidth <= 1024) {
      this.isSidebarOpen = false;
    }
  }

  onLogOut() {
    localStorage.removeItem('auth_token'); 
    this.router.navigate(['/login']);
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

setCompanyName() {
  const name = localStorage.getItem('company_name') ?? 'Rukinix';
  this.companyName = name;
}

}