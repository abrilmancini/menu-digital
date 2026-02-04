import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ProductService } from '../../core/services/productservice';
import { Product } from '../../core/interfaces/product';

// Importamos los componentes hijos para que dejen de dar error
import { ProductCardComponent } from '../../components/product-card/product-card';
import { QuickNavComponent } from '../../components/quick-nav/quick-nav';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  // Al agregar estos tres aquí, se van los errores rojos del HTML
  imports: [CommonModule, ProductCardComponent, QuickNavComponent],
  templateUrl: './restaurant-menu.html',
  styleUrls: ['./restaurant-menu.css']
})
export class RestaurantMenuComponent implements OnInit {
  categories: any[] = [];
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Lógica para cargar desde tu API de .NET
  }

  // Agregamos esta función para que el HTML no de error de "Method not implemented"
  getProductsByCategory(categoryId: number): Product[] {
    return this.products.filter(p => p.categoriaId === categoryId);
  }

  filterByCategory(event: any): void {
    console.log('Filtrando...', event);
  }
}