import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { BaseUrl } from '../../../interfaces/classes/BaseUrl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Asset } from '../../../interfaces/classes/Assets';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.css'
})
export class AssetsComponent implements OnInit {
  ngOnInit(): void {
   this.getAllAssets()
  }
  private baseurl = new BaseUrl(); // Base URL for API
  private http = inject(HttpClient); // Inject HttpClient
  asset = new Asset()
  assets : any[] = []

  // Helper method to get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // or get from auth service
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Method to handle asset submission
  onAddAsset() {
    // Validate the asset data
    if (!this.asset.name || !this.asset.description || !this.asset.assetNumber || this.asset.purchasePrice <= 0 || !this.asset.assetType) {
      alert('Please fill in all required fields.');
      return;
    }


    // Send the asset data to the backend
    const headers = this.getAuthHeaders();
    this.http.post(`${this.baseurl.url}add-asset`, this.asset, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Asset added successfully!');
          this.asset = new Asset()
          this.getAllAssets()
        },
        error: (error) => {
          console.error('Error adding asset:', error);
          alert('An error occurred while adding the asset.');
        }
      });
  }



// Method to fetch all assets
getAllAssets() {
  const headers = this.getAuthHeaders();

  this.http.get(`${this.baseurl.url}get-assets`, { headers })
    .subscribe({
      next: (response: any) => {
        console.log('Assets fetched successfully:', response);
        this.assets = response.assets; // Store the fetched assets
      },
      error: (error) => {
        console.error('Error fetching assets:', error);
        alert('An error occurred while fetching assets.');
      }
    });
}


}
