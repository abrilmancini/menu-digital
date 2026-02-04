import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ProductService } from '../../core/services/productservice';
import { Product } from '../../core/interfaces/product';
import { BannerComponent } from '../../components/banner/banner';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, BannerComponent, ProductCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  entradas: Product[] = [];
  platosFuertes: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
  // Llamamos a tu API de .NET
  this.productService.getProducts().subscribe({
    next: (data) => {
      // Filtramos según los IDs de categoría que tengas en SQLite
      this.entradas = data.filter(p => p.categoriaId === 1); 
      this.platosFuertes = data.filter(p => p.categoriaId === 2);
      console.log('Productos cargados con éxito');
    },
    error: (err) => console.error('Error al traer datos del puerto 7051', err)
  });
}
}