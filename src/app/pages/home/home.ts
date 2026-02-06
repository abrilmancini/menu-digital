import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ProductService } from '../../core/services/productservice';
import { Product } from '../../core/interfaces/product';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  entradas: Product[] = [];
  platosFuertes: Product[] = [];
  destacados: Product[] = [];
  isMenuOpen = false;

  @ViewChild('menuWrap') menuWrap?: ElementRef<HTMLElement>;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
  // Llamamos a tu API de .NET
  this.productService.getProducts().subscribe({
    next: (data) => {
      // Filtramos según los IDs de categoría que tengas en SQLite
      this.entradas = data.filter(p => p.categoriaId === 1); 
      this.platosFuertes = data.filter(p => p.categoriaId === 2);
      this.destacados = data.filter(p => p.isDestacado).slice(0, 4);
      console.log('Productos cargados con éxito');
    },
    error: (err) => console.error('Error al traer datos del puerto 7051', err)
  });
}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen || !this.menuWrap?.nativeElement) {
      return;
    }

    const target = event.target as Node;
    if (!this.menuWrap.nativeElement.contains(target)) {
      this.isMenuOpen = false;
    }
  }
}
