import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para formularios
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
  errorMessage: string = '';

  constructor(private authservice: Authservice, private router: Router) {}

  onLogin() {
    const email = this.loginData.email?.trim();
    const password = this.loginData.password;

    if (!email || !password) {
      this.errorMessage = 'Completá email y contraseña.';
      return;
    }

    const payload = {
      email,
      password,
      Email: email,
      Password: password
    };

    this.authservice.login(payload).subscribe({
      next: (response) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const apiMessage = err?.error?.message || err?.error?.title;
        this.errorMessage = apiMessage || 'Credenciales incorrectas. Verificá tu email y clave.';
      }
    });
  }
}
