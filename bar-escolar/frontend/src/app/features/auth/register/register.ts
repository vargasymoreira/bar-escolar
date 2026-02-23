import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RegisterRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  loading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

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
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched)) ||
      (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch'] && field?.touched);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.showToastMessage('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    this.loading = true;

    const registerData: RegisterRequest = {
      nombre: this.registerForm.value.nombre,
      cedula: this.registerForm.value.cedula,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.showToastMessage('¡Cuenta creada! Por favor, inicia sesión', 'success');

        // Esperar a que se vea el toast antes de navegar
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;

        // Mensajes de error más específicos
        let errorMessage = 'Error al crear la cuenta';

        if (err.status === 409) {
          errorMessage = 'Este correo ya está registrado';
        } else if (err.status === 400) {
          errorMessage = 'Datos inválidos. Verifica la información';
        } else if (err.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.showToastMessage(errorMessage, 'error');
        console.error('Error de registro:', err);
      },
    });
  }
}