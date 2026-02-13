import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/productservice';
import { RestaurantService } from '../../core/services/restaurant';
import { CategoryService } from '../../core/services/category.service';
import { Authservice } from '../../core/services/authservice';
import { Restaurant } from '../../core/interfaces/restaurant';
import { Category } from '../../core/interfaces/category';
import { Product } from '../../core/interfaces/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  allProducts: Product[] = [];
  restaurants: Restaurant[] = [];
  categories: Category[] = [];

  selectedRestaurantId: number | null = null;
  selectedCategoryId: number | null = null;
  searchTerm = '';
  showFeaturedOnly = false;
  showHappyHourOnly = false;

  pageSize = 10;
  pageIndex = 1;

  errorMessage = '';
  successMessage = '';
  isSaving = false;
  isLoading = false;
  deletingProductId: number | null = null;

  showModal = false;
  modalMode: 'create' | 'edit' = 'create';

  newItem: Partial<Product> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    precioHappyHour: 0,
    imagenUrl: '',
    isDestacado: false,
    isHappyHour: false,
    categoriaId: 0,
    restaurantId: 0
  };

  editItem: Product | null = null;
  modalItem: Partial<Product> = {};
  modalErrors: Record<string, string> = {};
  selectedImageName = '';
  isReadingImage = false;
  newCategoryName = '';
  isSavingCategory = false;
  ownerRestaurantId: number | null = null;

  constructor(
    private productService: ProductService,
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private authservice: Authservice,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOwnerContext();
  }

  private loadOwnerContext(): void {
    this.restaurantService.getMyRestaurant().subscribe({
      next: (restaurant) => {
        const id = Number(restaurant?.id ?? 0);
        if (id > 0) {
          this.ownerRestaurantId = id;
          this.selectedRestaurantId = id;
          this.restaurants = [restaurant];
          this.loadCategories(id);
          this.loadProductsByRestaurant(id);
          return;
        }
        this.loadFallbackContext();
      },
      error: () => {
        this.loadFallbackContext();
      }
    });
  }

  private loadFallbackContext(): void {
    this.loadRestaurants();
    this.loadAllCategories();
    this.loadProducts();
  }

  private extractApiError(error: any, fallback: string): string {
    const problem = error?.error;
    if (!problem) return fallback;

    const validation = problem.errors;
    if (validation && typeof validation === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(validation)) {
        const list = validation[key];
        if (Array.isArray(list)) {
          messages.push(...list);
        }
      }
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    const direct = problem.message || problem.title || problem.detail;
    if (typeof direct === 'string' && direct.trim()) {
      return direct;
    }

    return fallback;
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data ?? [];
        if (this.restaurants.length === 1) {
          this.selectedRestaurantId = this.restaurants[0].id;
          this.onRestaurantChange();
        }
      },
      error: (err) => {
        console.error('Error al cargar restaurantes', err);
      }
    });
  }

  loadCategories(restaurantId: number): void {
    this.categoryService.getCategoriesByRestaurant(restaurantId).subscribe({
      next: (data) => {
        this.categories = data ?? [];
      },
      error: (err) => {
        console.error('Error al cargar categorias', err);
        this.categories = [];
      }
    });
  }

  loadAllCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data ?? [];
      },
      error: (err) => {
        console.error('Error al cargar categorias', err);
        this.categories = [];
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data ?? [];
        this.isLoading = false;
        this.pageIndex = 1;
      },
      error: (err) => {
        console.error('Error al conectar con el backend 7051', err);
        this.errorMessage = this.extractApiError(err, 'No se pudieron cargar los productos.');
        this.isLoading = false;
      }
    });
  }

  loadProductsByRestaurant(restaurantId: number): void {
    this.isLoading = true;
    this.productService.getByRestaurant(restaurantId).subscribe({
      next: (data) => {
        this.allProducts = (data ?? []).map((p) => ({
          ...p,
          restaurantId: p.restaurantId && p.restaurantId > 0 ? p.restaurantId : restaurantId
        }));
        this.isLoading = false;
        this.pageIndex = 1;
      },
      error: (err) => {
        console.error('Error al cargar productos por restaurante', err);
        this.errorMessage = this.extractApiError(err, 'No se pudieron cargar los productos del restaurante.');
        this.isLoading = false;
      }
    });
  }

  onRestaurantChange(): void {
    if (this.ownerRestaurantId) {
      this.selectedRestaurantId = this.ownerRestaurantId;
    }

    if (this.selectedRestaurantId) {
      this.loadCategories(this.selectedRestaurantId);
      this.loadProductsByRestaurant(this.selectedRestaurantId);
      this.selectedCategoryId = null;
      this.modalItem.categoriaId = 0;
      this.modalItem.restaurantId = this.selectedRestaurantId;
    } else {
      this.loadAllCategories();
      this.selectedCategoryId = null;
      this.loadProducts();
    }
    this.pageIndex = 1;
  }

  onFiltersChange(): void {
    this.pageIndex = 1;
  }

  getPublicMenuRoute(): (string | number)[] {
    if (this.selectedRestaurantId) {
      return ['/menu', this.selectedRestaurantId];
    }
    return ['/restaurants'];
  }

  getCategoryName(categoryId: number): string {
    const match = this.categories.find((c) => Number(c.id) === Number(categoryId));
    return match?.nombre || `Categoria #${categoryId}`;
  }

  getRestaurantName(restaurantId: number | undefined): string {
    const id = Number(restaurantId ?? 0);
    if (!id) return 'No asignado';
    const match = this.restaurants.find((r) => Number(r.id) === id);
    return match?.nombre || match?.name || `Restaurante #${id}`;
  }

  onModalCategoryChange(): void {
    if (!this.modalItem.categoriaId) return;
    const selected = this.categories.find((c) => c.id === this.modalItem.categoriaId);
    if (selected?.restaurantId) {
      this.modalItem.restaurantId = selected.restaurantId;
    }
  }

  onCreateCategory(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const name = this.newCategoryName.trim();
    if (!name) {
      this.errorMessage = 'Ingresá un nombre de categoría.';
      return;
    }
    if (!this.selectedRestaurantId) {
      this.errorMessage = 'Seleccioná un restaurante para crear la categoría.';
      return;
    }

    this.isSavingCategory = true;
    this.categoryService
      .createCategory({ Name: name, RestaurantId: this.selectedRestaurantId })
      .subscribe({
        next: () => {
          this.newCategoryName = '';
          this.successMessage = 'Categoría creada.';
          this.isSavingCategory = false;
          this.loadCategories(this.selectedRestaurantId!);
        },
        error: (err) => {
          this.errorMessage = this.extractApiError(err, 'No se pudo crear la categoría.');
          this.isSavingCategory = false;
        }
      });
  }

  onDeleteCategory(id: number): void {
    if (!id || id <= 0) return;
    if (!confirm('¿Seguro querés eliminar esta categoría?')) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage = 'Categoría eliminada.';
        if (this.selectedRestaurantId) {
          this.loadCategories(this.selectedRestaurantId);
        } else {
          this.loadAllCategories();
        }
      },
      error: (err) => {
        this.errorMessage = this.extractApiError(err, 'No se pudo eliminar la categoría.');
      }
    });
  }

  get filteredProducts(): Product[] {
    let list = [...this.allProducts];

    if (this.selectedRestaurantId) {
      const selectedId = Number(this.selectedRestaurantId);
      list = list.filter((p) => {
        const productRestaurantId = Number(p.restaurantId ?? 0);
        return productRestaurantId <= 0 || productRestaurantId === selectedId;
      });
    }

    if (this.selectedCategoryId) {
      const selectedCategoryId = Number(this.selectedCategoryId);
      list = list.filter((p) => Number(p.categoriaId ?? 0) === selectedCategoryId);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter((p) =>
        p.nombre?.toLowerCase().includes(term) || p.descripcion?.toLowerCase().includes(term)
      );
    }

    if (this.showFeaturedOnly) {
      list = list.filter((p) => p.isDestacado);
    }

    if (this.showHappyHourOnly) {
      list = list.filter((p) => p.isHappyHour);
    }

    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  get pagedProducts(): Product[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get featuredCount(): number {
    return this.filteredProducts.filter((p) => p.isDestacado).length;
  }

  get happyHourCount(): number {
    return this.filteredProducts.filter((p) => p.isHappyHour).length;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page;
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.errorMessage = '';
    this.successMessage = '';
    this.newItem = {
      nombre: '',
      descripcion: '',
      precio: 0,
      precioHappyHour: 0,
      imagenUrl: '',
      isDestacado: false,
      isHappyHour: false,
      categoriaId: this.selectedCategoryId ?? 0,
      restaurantId: this.ownerRestaurantId ?? this.selectedRestaurantId ?? 0
    };
    this.modalItem = { ...this.newItem };
    if (this.ownerRestaurantId || this.selectedRestaurantId) {
      this.modalItem.restaurantId = this.ownerRestaurantId ?? this.selectedRestaurantId ?? 0;
    }
    this.selectedImageName = '';
    this.modalErrors = {};
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.modalMode = 'edit';
    this.errorMessage = '';
    this.successMessage = '';
    this.editItem = { ...product };
    this.modalItem = { ...product };
    this.selectedImageName = '';
    this.modalErrors = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editItem = null;
    this.modalItem = {};
    this.selectedImageName = '';
    this.modalErrors = {};
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Seleccioná un archivo de imagen válido.';
      this.selectedImageName = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage = 'La imagen supera 2MB. Elegí una más liviana.';
      this.selectedImageName = '';
      return;
    }

    this.errorMessage = '';
    this.isReadingImage = true;
    this.selectedImageName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.modalItem.imagenUrl = typeof reader.result === 'string' ? reader.result : '';
      this.isReadingImage = false;
    };
    reader.onerror = () => {
      this.errorMessage = 'No se pudo leer la imagen seleccionada.';
      this.isReadingImage = false;
    };
    reader.readAsDataURL(file);
  }

  private validateModal(payload: Partial<Product>): boolean {
    this.modalErrors = {};

    if (!payload.nombre) {
      this.modalErrors['nombre'] = 'Ingresá el nombre.';
    }

    const price = Number(payload.precio);
    if (!Number.isFinite(price) || price <= 0 || price > 10000) {
      this.modalErrors['precio'] = 'Ingresá un precio entre 0.01 y 10000.';
    }

    if (!payload.categoriaId || Number(payload.categoriaId) <= 0) {
      this.modalErrors['categoriaId'] = 'Seleccioná una categoria.';
    }

    if (!payload.restaurantId || Number(payload.restaurantId) <= 0) {
      this.modalErrors['restaurantId'] = 'Seleccioná un restaurante.';
    }

    return Object.keys(this.modalErrors).length === 0;
  }

  onSaveCreate(): void {
    if (this.isReadingImage) {
      this.errorMessage = 'Esperá a que termine de cargarse la imagen.';
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';

    const payload: Partial<Product> = {
      ...this.modalItem,
      nombre: this.modalItem.nombre?.trim(),
      descripcion: this.modalItem.descripcion?.trim(),
      restaurantId: this.ownerRestaurantId ?? this.modalItem.restaurantId
    };

    if (!this.validateModal(payload)) {
      this.errorMessage = 'Revisá los campos marcados.';
      return;
    }

    const selectedCategory = this.categories.find((c) => c.id === payload.categoriaId);
    if (selectedCategory?.restaurantId && selectedCategory.restaurantId !== payload.restaurantId) {
      this.errorMessage = 'La categoría seleccionada no pertenece al restaurante indicado.';
      this.modalErrors['categoriaId'] = 'La categoria no coincide con el restaurante.';
      return;
    }

    this.isSaving = true;
    const imageUrl = (payload.imagenUrl || '').trim();
    const hasHappyHourPrice = payload.isHappyHour && Number(payload.precioHappyHour ?? 0) > 0;

    const apiPayload = {
      Name: String(payload.nombre),
      Description: payload.descripcion || undefined,
      Price: Number(payload.precio),
      HappyHourPrice: hasHappyHourPrice ? Number(payload.precioHappyHour) : undefined,
      ImageUrl: imageUrl ? imageUrl : undefined,
      IsFeatured: !!payload.isDestacado,
      IsHappyHour: !!payload.isHappyHour,
      MenuCategoryId: Number(payload.categoriaId),
      RestaurantId: Number(payload.restaurantId)
    };

    this.productService.createProduct(apiPayload).subscribe({
      next: () => {
        this.successMessage = 'Producto creado.';
        this.isSaving = false;
        this.closeModal();
        if (this.selectedRestaurantId) {
          this.loadProductsByRestaurant(this.selectedRestaurantId);
        } else {
          this.loadProducts();
        }
      },
      error: (err) => {
        this.errorMessage = this.extractApiError(err, 'No se pudo crear el producto.');
        console.error('Error al crear producto', err);
        this.isSaving = false;
      }
    });
  }

  onSaveEdit(): void {
    if (!this.editItem) return;
    if (this.isReadingImage) {
      this.errorMessage = 'Esperá a que termine de cargarse la imagen.';
      return;
    }

    const payload: Partial<Product> = {
      ...this.modalItem,
      nombre: this.modalItem.nombre?.trim(),
      descripcion: this.modalItem.descripcion?.trim(),
      restaurantId: this.ownerRestaurantId ?? this.modalItem.restaurantId
    };

    if (!this.validateModal(payload)) {
      this.errorMessage = 'Revisá los campos marcados.';
      return;
    }

    const selectedCategory = this.categories.find((c) => c.id === payload.categoriaId);
    if (selectedCategory?.restaurantId && selectedCategory.restaurantId !== payload.restaurantId) {
      this.errorMessage = 'La categoría seleccionada no pertenece al restaurante indicado.';
      this.modalErrors['categoriaId'] = 'La categoria no coincide con el restaurante.';
      return;
    }

    this.isSaving = true;
    const imageUrl = (payload.imagenUrl || '').trim();
    const hasHappyHourPrice = payload.isHappyHour && Number(payload.precioHappyHour ?? 0) > 0;

    const apiPayload = {
      Name: String(payload.nombre),
      Description: payload.descripcion || undefined,
      Price: Number(payload.precio),
      HappyHourPrice: hasHappyHourPrice ? Number(payload.precioHappyHour) : undefined,
      ImageUrl: imageUrl ? imageUrl : undefined,
      IsFeatured: !!payload.isDestacado,
      IsHappyHour: !!payload.isHappyHour,
      MenuCategoryId: Number(payload.categoriaId),
      RestaurantId: Number(payload.restaurantId)
    };

    this.productService.updateProduct(this.editItem.id, apiPayload).subscribe({
      next: () => {
        this.successMessage = 'Producto actualizado.';
        this.isSaving = false;
        this.closeModal();
        if (this.selectedRestaurantId) {
          this.loadProductsByRestaurant(this.selectedRestaurantId);
        } else {
          this.loadProducts();
        }
      },
      error: (err) => {
        this.errorMessage = this.extractApiError(err, 'No se pudo actualizar el producto.');
        console.error('Error al actualizar producto', err);
        this.isSaving = false;
      }
    });
  }

  onDelete(id: number): void {
    if (!id || id <= 0) {
      this.errorMessage = 'No se puede eliminar: el ID del producto es inválido.';
      return;
    }

    if (confirm('¿Seguro quieres eliminar este producto?')) {
      this.deletingProductId = id;
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.successMessage = 'Producto eliminado.';
          this.deletingProductId = null;
          if (this.selectedRestaurantId) {
            this.loadProductsByRestaurant(this.selectedRestaurantId);
          } else {
            this.loadProducts();
          }
        },
        error: (err) => {
          console.error('Error al borrar producto', err);
          this.deletingProductId = null;
          if (err?.status === 403) {
            this.errorMessage = 'No tenés permisos para eliminar este producto.';
            return;
          }
          if (err?.status === 404) {
            this.errorMessage = 'Producto no encontrado o ya eliminado.';
            return;
          }
          this.errorMessage = this.extractApiError(err, 'No se pudo eliminar el producto.');
        }
      });
    }
  }
  onLogout(): void {
    if (!confirm('¿Querés cerrar sesión?')) {
      return;
    }
    this.authservice.clearToken();
    this.router.navigate(['/login']);
  }
}


