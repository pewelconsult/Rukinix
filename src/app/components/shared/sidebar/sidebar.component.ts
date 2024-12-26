import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], // Added RouterLinkActive
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isSidebarOpen = false;
  activeLink = 'dashboard';

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
}