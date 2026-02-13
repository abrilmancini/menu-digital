import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { environment } from '../../../environments/environment';

interface MenuCategoryPayload {
  Name: string;
  RestaurantId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/MenuCategory`;

  constructor(private http: HttpClient) {}

  private toCategory(item: any): Category {
    return {
      id: Number(item?.id ?? 0),
      nombre: item?.name ?? '',
      restaurantId: Number(item?.restaurantId ?? 0)
    };
  }

  private toCategories(items: any[] | null | undefined): Category[] {
    return (items ?? []).map((item) => this.toCategory(item));
  }

  getCategoriesByRestaurant(restaurantId: number): Observable<Category[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/restaurant/${restaurantId}`)
      .pipe(map((items) => this.toCategories(items)));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(map((items) => this.toCategories(items)));
  }

  createCategory(payload: MenuCategoryPayload): Observable<Category> {
    return this.http.post<any>(this.apiUrl, payload).pipe(map((item) => this.toCategory(item)));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
