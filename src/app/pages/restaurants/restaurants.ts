import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant';
import { Restaurant } from '../../core/interfaces/restaurant';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurants.html',
  styleUrls: ['./restaurants.css']
})
export class RestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;
  errorMessage = '';

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  private fetchRestaurants(): void {
    this.loading = true;
    this.errorMessage = '';

    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar los restaurantes.';
        console.error('Error al traer restaurantes', err);
      }
    });
  }

  getRestaurantName(restaurant: Restaurant): string {
    return restaurant.nombre || restaurant.name || 'Restaurante';
  }

  getRestaurantDescription(restaurant: Restaurant): string {
    return restaurant.descripcion || 'Menú digital disponible.';
  }

  getRestaurantId(restaurant: Restaurant): number {
    return restaurant.id;
  }
}
