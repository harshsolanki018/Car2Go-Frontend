import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { FlashMessageService } from '../../../core/services/flash-message';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-owner-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './owner-login.html',
  styleUrls: ['./owner-login.css'],
})
export class OwnerLogin {
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private flash: FlashMessageService
  ) {}

  async login(): Promise<void> {
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

    const result = await this.auth.login(normalizedEmail, this.password, 'Owner');
    if (!result.success) {
      this.setError(result.message);
      return;
    }

    if (this.auth.getRole() !== 'Owner' && this.auth.getRole() !== 'Admin') {
      await this.auth.logout('/owner-login');
      this.setError('Please enter a valid email or password.');
      return;
    }

    this.setSuccess(`${result.message} Redirecting...`);
    setTimeout(() => {
      if (this.auth.getRole() === 'Admin') {
        this.router.navigate(['/admin']);
        return;
      }
      this.router.navigate(['/owner']);
    }, 800);
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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


