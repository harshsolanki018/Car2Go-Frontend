import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { FlashMessageService } from '../../../core/services/flash-message';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword implements OnDestroy {
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  portalRole: 'User' | 'Owner' = 'User';
  portalLabel = 'User';
  loginRoute = '/login';

  email = '';
  otp = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  otpSent = false;
  isSubmitting = false;
  resendCountdown = 0;
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    const roleFromRoute = String(this.route.snapshot.data?.['role'] || '').toLowerCase();
    if (roleFromRoute === 'owner') {
      this.portalRole = 'Owner';
      this.portalLabel = 'Partner';
      this.loginRoute = this.route.snapshot.data?.['loginRoute'] || '/owner-login';
    }
  }

  get isOwnerPortal(): boolean {
    return this.portalRole === 'Owner';
  }

  async requestOtp(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }
    const email = this.email.trim().toLowerCase();
    if (!email) {
      this.flash.showError('Please enter your email.');
      return;
    }

    try {
      this.isSubmitting = true;
      const result = await this.auth.forgotPassword(email, this.portalRole);
      if (!result.success) {
        this.flash.showError(result.message);
        return;
      }
      this.otpSent = true;
      this.startResendCountdown(result.retryAfterSeconds ?? 60);
      this.flash.showSuccess(result.message);
    } finally {
      this.isSubmitting = false;
    }
  }

  async resendOtp(): Promise<void> {
    if (!this.otpSent || this.resendCountdown > 0 || this.isSubmitting) {
      return;
    }
    await this.requestOtp();
  }

  async resetPassword(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }
    if (!this.otpSent) {
      return;
    }
    if (!this.otp.trim()) {
      this.flash.showError('Please enter the OTP.');
      return;
    }
    if (!this.password || this.password !== this.confirmPassword) {
      this.flash.showError('Passwords do not match.');
      return;
    }

    try {
      this.isSubmitting = true;
      const result = await this.auth.resetPassword({
        email: this.email,
        otp: this.otp,
        password: this.password,
        role: this.portalRole,
      });
      if (!result.success) {
        this.flash.showError(result.message);
        return;
      }
      this.flash.showSuccess(result.message);
      setTimeout(() => {
        this.router.navigate([this.loginRoute]);
      }, 1000);
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
}
