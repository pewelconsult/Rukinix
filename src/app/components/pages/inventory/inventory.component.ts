import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../interfaces/classes/Products';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit{

   ngOnInit(): void {
    this.getAllCategories()
   }

   CategoryData:any={
    name:""
   }

   http = inject(HttpClient)
   allcategories: any[] = [];
   product: Product = new Product();

   onAddCategory() {

    const categoryData = {
      category: this.CategoryData.name
    }
    this.http.post("http://localhost:3000/add-category", categoryData).subscribe((res:any)=> {
      console.log(res)
      this.CategoryData.name=""
      this.getAllCategories()
    })
   }


   onAddProduct() {
      const categoryData = {
        category: this.CategoryData.name
      }
      this.http.post("http://localhost:3000/add-category", categoryData).subscribe((res:any)=> {
        console.log(res)
        this.CategoryData.name=""
        this.getAllCategories()
      })
   }

   getAllCategories() {
    this.http.get("http://localhost:3000/categories").subscribe((res:any)=> {
      this.allcategories = res.data
      console.log(this.allcategories)
    })
   }
}



