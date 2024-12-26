import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'storemanagerapp';

  showSidebar = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Conditionally set showSidebar based on current route
        this.showSidebar = !this.isExcludedRoute(event.url);
      }
    });
  }

  private isExcludedRoute(url: string): boolean {
    // List routes where you don't want the sidebar
    const excludedRoutes = ['/login', '/register', '/error'];
    return excludedRoutes.includes(url);
  }
}
