import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.apiBaseUrl}/Restaurant`;
  private categoryApiUrl = `${environment.apiBaseUrl}/MenuCategory`;

  constructor(private http: HttpClient) {}

  // Public: list restaurants
  getRestaurants(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Public: restaurant detail
  getRestaurantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Owner: current restaurant
  getMyRestaurant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  // Owner: categories by restaurant
  getCategories(restaurantId: number): Observable<Category[]> {
    return this.http
      .get<any[]>(`${this.categoryApiUrl}/restaurant/${restaurantId}`)
      .pipe(
        map((items) =>
          (items ?? []).map((item) => ({
            id: Number(item?.id ?? 0),
            nombre: item?.name ?? '',
            restaurantId: Number(item?.restaurantId ?? 0)
          }))
        )
      );
  }

  // Owner: create restaurant (if you need it)
  register(restaurantData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, restaurantData);
  }

  // Owner: delete account
  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
