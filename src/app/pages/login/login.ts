import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Authservice } from '../../core/services/authservice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  errorMessage = '';

  constructor(private authservice: Authservice, private router: Router) {}

  onLogin() {
    const email = this.loginData.email?.trim();
    const password = this.loginData.password;

    if (!email || !password) {
      this.errorMessage = 'Completa email y contrasena.';
      return;
    }

    const payload = {
      email,
      password
    };

    this.authservice.login(payload).subscribe({
      next: (response) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err?.status === 0) {
          this.errorMessage = 'No se pudo conectar con el backend. Verifica que la API este levantada.';
          return;
        }
        if (err?.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu email y clave.';
          return;
        }
        const apiMessage = err?.error?.message || err?.error?.title;
        this.errorMessage = apiMessage || 'No se pudo iniciar sesion.';
      }
    });
  }
}
