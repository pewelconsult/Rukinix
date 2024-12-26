import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/classes/Products';
import { BaseUrl } from '../interfaces/classes/BaseUrl';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseurl = new BaseUrl()
  private apiUrl =  this.baseurl.url + 'products';

  constructor(private http: HttpClient) { }

  
  getAllProducts() {
    return this.http.get(this.apiUrl)
  }
}