import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para formularios
import { Router } from '@angular/router';
import { Authservice } from '../../core/services/authservice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  errorMessage: string = '';

  constructor(private authservice: Authservice, private router: Router) {}

  onLogin() {
    this.authservice.login(this.loginData).subscribe({
      next: (response) => {
        // Guardamos el Token JWT que genera tu backend
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas. Verificá tu email y clave.';
      }
    });
  }
}
