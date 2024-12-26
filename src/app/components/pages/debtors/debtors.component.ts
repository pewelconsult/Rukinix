import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './debtors.component.html',
  styleUrl: './debtors.component.css'
})
export class DebtorsComponent {

}
