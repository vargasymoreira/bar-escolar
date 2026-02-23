import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { LoginRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading: boolean = false;
  showPassword: boolean = false;

  // Toast properties
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'error';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Ocultar toast después de 4 segundos
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.showToastMessage('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    this.loading = true;

    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.showToastMessage('¡Inicio de sesión exitoso!', 'success');

        // Esperar a que se vea el toast antes de navegar
        setTimeout(() => {
          if (response.user.role === 'ADMIN_BAR') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/menu']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;

        // Mensajes de error más específicos
        let errorMessage = 'Error al iniciar sesión';

        if (err.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (err.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (err.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.showToastMessage(errorMessage, 'error');
        console.error('Error de login:', err);
      },
    });
  }
}