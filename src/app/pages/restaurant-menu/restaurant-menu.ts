import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/productservice';
import { RestaurantService } from '../../core/services/restaurant';
import { Category } from '../../core/interfaces/category';
import { Product } from '../../core/interfaces/product';

import { ProductCardComponent } from '../../components/product-card/product-card';
import { QuickNavComponent } from '../../components/quick-nav/quick-nav';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, QuickNavComponent],
  templateUrl: './restaurant-menu.html',
  styleUrls: ['./restaurant-menu.css']
})
export class RestaurantMenuComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  destacados: Product[] = [];
  happyHour: Product[] = [];
  restaurantName = '';
  selectedCategoryId: number | null = null;
  loading = true;
  errorMessage = '';
  private restaurantId = 1;

  constructor(
    private productService: ProductService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.restaurantId = Number.isFinite(id) && id > 0 ? id : 1;
      this.loadData();
    });
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter((p) =>
          typeof p.restaurantId === 'number' ? p.restaurantId === this.restaurantId : true
        );
        this.destacados = this.products.filter((p) => p.isDestacado);
        this.happyHour = this.products.filter((p) => p.isHappyHour);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar los productos.';
        console.error('Error al traer productos', err);
      }
    });

    this.restaurantService.getCategories(this.restaurantId).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar las categorías.';
        console.error('Error al traer categorías', err);
      }
    });

    this.restaurantService.getRestaurantById(this.restaurantId).subscribe({
      next: (restaurant) => {
        this.restaurantName = restaurant?.nombre || restaurant?.name || '';
      },
      error: (err) => {
        console.error('Error al traer restaurante', err);
      }
    });
  }

  getProductsByCategory(categoryId: number): Product[] {
    const list = this.products.filter(p => p.categoriaId === categoryId);
    if (this.selectedCategoryId === null || this.selectedCategoryId === categoryId) {
      return list;
    }
    return [];
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
  }
}
