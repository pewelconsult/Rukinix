import { Component } from '@angular/core';
import { AdminsidebarComponent } from '../admin pages/adminsidebar/adminsidebar.component';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminsidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
