import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { environment } from '../../../environments/environment';

interface MenuItemPayload {
  Name: string;
  Description?: string;
  Price: number;
  HappyHourPrice?: number;
  ImageUrl?: string;
  IsFeatured?: boolean;
  IsHappyHour?: boolean;
  MenuCategoryId: number;
  RestaurantId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/MenuItem`;

  constructor(private http: HttpClient) {}

  private normalizeImageUrl(value: any): string {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    if (
      raw.startsWith('data:image/') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('blob:') ||
      raw.startsWith('assets/') ||
      raw.startsWith('/')
    ) {
      return raw;
    }

    // Backend may return bare base64 without data-url prefix
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 80;
    if (isBase64) {
      let mime = 'image/jpeg';
      if (raw.startsWith('iVBOR')) mime = 'image/png';
      else if (raw.startsWith('R0lGOD')) mime = 'image/gif';
      else if (raw.startsWith('UklGR')) mime = 'image/webp';
      return `data:${mime};base64,${raw}`;
    }

    // If backend stores only file name, try local assets folder
    if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(raw)) {
      return `assets/images/${raw}`;
    }

    return raw;
  }

  private toProduct(item: any): Product {
    const asNumber = (value: any, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };
    const asBool = (value: any) => value === true || value === 1 || value === '1';

    return {
      id: asNumber(item?.id ?? item?.Id),
      nombre: item?.name ?? item?.Name ?? '',
      descripcion: item?.description ?? item?.Description ?? '',
      precio: asNumber(item?.price ?? item?.Price),
      precioHappyHour: asNumber(item?.happyHourPrice ?? item?.HappyHourPrice),
      imagenUrl: this.normalizeImageUrl(item?.imageUrl ?? item?.ImageUrl ?? item?.image_url),
      isDestacado: asBool(item?.isFeatured ?? item?.IsFeatured ?? item?.is_featured),
      isHappyHour: asBool(
        item?.isHappyHour ??
          item?.IsHappyHour ??
          item?.happyHourEnabled ??
          item?.happy_hour_enabled
      ),
      categoriaId: asNumber(
        item?.menuCategoryId ??
          item?.MenuCategoryId ??
          item?.categoryId ??
          item?.category_id ??
          item?.menuCategory?.id ??
          item?.category?.id
      ),
      restaurantId: asNumber(
        item?.restaurantId ??
          item?.RestaurantId ??
          item?.userId ??
          item?.user_id ??
          item?.restaurant?.id ??
          item?.owner?.id
      )
    };
  }

  private toProducts(items: any[] | null | undefined): Product[] {
    return (items ?? []).map((item) => this.toProduct(item));
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(map((items) => this.toProducts(items)));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map((item) => this.toProduct(item)));
  }

  getByRestaurant(restaurantId: number): Observable<Product[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/restaurant/${restaurantId}`)
      .pipe(map((items) => this.toProducts(items)));
  }

  getByCategory(categoryId: number): Observable<Product[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/category/${categoryId}`)
      .pipe(map((items) => this.toProducts(items)));
  }

  getFeatured(restaurantId: number): Observable<Product[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/restaurant/${restaurantId}/featured`)
      .pipe(map((items) => this.toProducts(items)));
  }

  getDiscounted(restaurantId: number): Observable<Product[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/restaurant/${restaurantId}/discounted`)
      .pipe(map((items) => this.toProducts(items)));
  }

  getHappyHour(restaurantId: number): Observable<Product[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/restaurant/${restaurantId}/happy-hour`)
      .pipe(map((items) => this.toProducts(items)));
  }

  createProduct(payload: MenuItemPayload): Observable<Product> {
    return this.http.post<any>(this.apiUrl, payload).pipe(map((item) => this.toProduct(item)));
  }

  updateProduct(id: number, payload: MenuItemPayload): Observable<Product> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(map((item) => this.toProduct(item)));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
