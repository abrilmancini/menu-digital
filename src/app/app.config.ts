import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes'; // Importamos tus rutas
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Conecta las rutas con la aplicacion
    provideHttpClient(withInterceptors([authInterceptor])) // Habilita la conexion al puerto 7051
  ]
};
