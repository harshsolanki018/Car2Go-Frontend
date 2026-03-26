import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { FlashMessageService } from '../../../core/services/flash-message';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnDestroy {
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  otp = '';
  otpSent = false;
  isVerifying = false;
  isSubmitting = false;
  resendCountdown = 0;
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  async register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.otpSent) {
      await this.verifyOtp();
      return;
    }

    const name = this.name.trim();
    const email = this.email.toLowerCase().trim();
    const phone = this.phone.trim();
    const password = this.password;

    if (!name || !email || !phone || !password) {
      this.setError('Please fill all required fields.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.setError('Invalid email format.');
      return;
    }

    if (!this.validatePhone(phone)) {
      this.setError('Phone number must be 10 digits.');
      return;
    }

    if (!this.validatePassword(password)) {
      this.setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    if (password !== this.confirmPassword) {
      this.setError('Passwords do not match.');
      return;
    }

    if (!this.acceptTerms) {
      this.setError('You must accept terms & conditions.');
      return;
    }

    try {
      this.isSubmitting = true;
      const result = await this.auth.register({
        name,
        email,
        phone,
        password,
      });

      if (!result.success) {
        this.setError(result.message);
        return;
      }

      if (result.requiresOtp) {
        this.otpSent = true;
        this.startResendCountdown(result.retryAfterSeconds ?? 60);
        this.setSuccess(result.message);
        return;
      }

      this.setSuccess(`${result.message} Redirecting...`);
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1200);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async verifyOtp() {
    const otp = this.otp.trim();
    if (!otp || otp.length < 4) {
      this.setError('Please enter a valid OTP.');
      return;
    }

    try {
      this.isVerifying = true;
      const result = await this.auth.verifyOtp({
        name: this.name,
        email: this.email,
        phone: this.phone,
        password: this.password,
        otp,
      });

      if (!result.success) {
        this.setError(result.message);
        return;
      }

      this.setSuccess(`${result.message} Redirecting...`);
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1200);
    } finally {
      this.isVerifying = false;
    }
  }

  async resendOtp(): Promise<void> {
    if (!this.otpSent || this.isSubmitting || this.resendCountdown > 0) {
      return;
    }
    try {
      this.isSubmitting = true;
      const result = await this.auth.resendOtp({
        name: this.name,
        email: this.email,
      });

      if (!result.success) {
        this.setError(result.message);
        return;
      }

      this.startResendCountdown(result.retryAfterSeconds ?? 60);
      this.setSuccess(result.message);
    } finally {
      this.isSubmitting = false;
    }
  }

  private startResendCountdown(seconds: number): void {
    this.resendCountdown = Math.max(0, Math.floor(seconds));
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
    if (this.resendCountdown <= 0) {
      return;
    }
    this.resendTimer = setInterval(() => {
      this.resendCountdown = Math.max(0, this.resendCountdown - 1);
      this.cdr.detectChanges();
      if (this.resendCountdown === 0 && this.resendTimer) {
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }

  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validatePhone(phone: string): boolean {
    return /^[0-9]{10}$/.test(phone);
  }

  validatePassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
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
