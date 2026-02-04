import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // Importamos tus rutas
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Conecta las rutas con la aplicación
    provideHttpClient()    // Habilita la conexión al puerto 7051
  ]
};