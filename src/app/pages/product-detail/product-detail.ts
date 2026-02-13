import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/productservice';
import { Product } from '../../core/interfaces/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  errorMessage = '';
  fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23f9e8ea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2392262c' font-size='28' font-family='Arial'%3ESin imagen%3C/text%3E%3C/svg%3E";

  constructor(private route: ActivatedRoute, private productService: ProductService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) {
        this.errorMessage = 'Producto no encontrado.';
        this.loading = false;
        return;
      }

      this.fetchProduct(id);
    });
  }

  private fetchProduct(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product ?? null;
        if (!this.product) this.errorMessage = 'Producto no encontrado.';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el producto.';
        this.loading = false;
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.fallbackImage;
  }
}
