import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RestaurantMenuComponent } from './pages/restaurant-menu/restaurant-menu';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { RestaurantsComponent } from './pages/restaurants/restaurants';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Página inicial (localhost:4200)
    { path: 'restaurants', component: RestaurantsComponent },
    { path: 'menu/:id', component: RestaurantMenuComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
