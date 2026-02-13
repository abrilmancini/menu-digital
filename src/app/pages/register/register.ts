import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Authservice } from '../../core/services/authservice';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  formData = {
    restaurantName: '',
    email: '',
    password: '',
    address: '',
    phone: ''
  };

  errorMessage = '';
  successMessage = '';

  constructor(private authservice: Authservice, private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const restaurantName = this.formData.restaurantName.trim();
    const email = this.formData.email.trim();
    const password = this.formData.password;

    if (!restaurantName || !email || !password) {
      this.errorMessage = 'Completá nombre, email y contraseña.';
      return;
    }

    const payload = {
      name: restaurantName,
      email,
      passwordHash: password
    };

    this.authservice.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Cuenta creada. Ya podés iniciar sesión.';
        setTimeout(() => this.router.navigate(['/login']), 800);
      },
      error: (err) => {
        const apiMessage = err?.error?.message || err?.error?.title;
        this.errorMessage = apiMessage || 'No se pudo registrar. Verificá los datos.';
      }
    });
  }
}
