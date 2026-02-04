import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/productservice';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  allProducts: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        console.log('Dashboard: Datos de SQLite cargados');
      },
      error: (err) => console.error('Error al conectar con el backend 7051', err)
    });
  }

  onDelete(id: number) {
    if(confirm('¿Seguro quieres eliminar este producto?')) {
      // Aquí llamarías al método delete de tu servicio
      console.log('Borrando producto:', id);
    }
  }

  onEdit(product: any) {
    console.log('Editando:', product);
  }
}