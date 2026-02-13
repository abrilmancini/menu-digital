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
  destacados: Product[] = [];
  isMenuOpen = false;

  @ViewChild('menuWrap') menuWrap?: ElementRef<HTMLElement>;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.destacados = data.filter((p) => p.isDestacado).slice(0, 4);
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
