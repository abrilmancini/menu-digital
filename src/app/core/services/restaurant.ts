import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'https://localhost:7051/api/Restaurants';

  constructor(private http: HttpClient) { }

  // Invitado: Ver lista de restaurants disponibles
  getRestaurants(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener info de un restaurant específico (para el encabezado del menú)
  getRestaurantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Dueño: Gestión de categorías
  getCategories(restaurantId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${restaurantId}/categories`);
  }

  // Registro de dueño (Aquí el Back hashea la pass)
  register(restaurantData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, restaurantData);
  }

  // Dueño: Borrar su propia cuenta
  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
