import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// Ruta corregida (subimos dos niveles hasta core e ingresamos a interfaces)
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Verificá que el puerto sea el que te da Visual Studio al darle Play
  private apiUrl = 'https://localhost:7051/api/MenuItem'; // Actualizado al puerto 7051

  constructor(private http: HttpClient) { }

  // Esta es la función que te faltaba y por la que Home daba error
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}