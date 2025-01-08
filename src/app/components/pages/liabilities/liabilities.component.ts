import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-liabilities',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './liabilities.component.html',
  styleUrl: './liabilities.component.css'
})
export class LiabilitiesComponent {

}
