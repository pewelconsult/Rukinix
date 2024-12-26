import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-storemanager',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './storemanager.component.html',
  styleUrl: './storemanager.component.css'
})
export class StoremanagerComponent {

}
