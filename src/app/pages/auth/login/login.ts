import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { FlashMessageService } from '../../../core/services/flash-message';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye , faEyeSlash } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private flash: FlashMessageService
  ) {}

  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  /* ===============================
     MAIN LOGIN FUNCTION
  ================================ */

  async login() {

    this.errorMessage = '';
    this.successMessage = '';

    const normalizedEmail = this.email.trim().toLowerCase();

    if (!normalizedEmail || !this.password) {
      this.setError('Please enter email and password.');
      return;
    }

    if (!this.validateEmail(normalizedEmail)) {
      this.setError('Please enter a valid email address.');
      return;
    }

    const result = await this.auth.login(
      normalizedEmail,
      this.password,
      'User'
    );

    if (!result.success) {
      this.setError(result.message);
      return;
    }

    this.setSuccess(result.message + ' Redirecting...');

    setTimeout(() => {

      const role = this.auth.getRole();

      if (role === 'Admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }

    }, 800);
  }

  private validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.flash.showError(message);
    this.scheduleMessageClear();
  }

  private setSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.flash.showSuccess(message);
    this.scheduleMessageClear();
  }

  private scheduleMessageClear(): void {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }

    this.messageTimer = setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
      this.messageTimer = null;
    }, 2000);
  }
}
