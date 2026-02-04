import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RestaurantMenuComponent } from './pages/restaurant-menu/restaurant-menu';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Página inicial (localhost:4200)
    { path: 'menu', component: RestaurantMenuComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: '**', redirectTo: '' } 
];