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

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.product = products.find((p) => p.id === id) ?? null;
        if (!this.product) {
          this.errorMessage = 'Producto no encontrado.';
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el producto.';
        this.loading = false;
      }
    });
  }
}
