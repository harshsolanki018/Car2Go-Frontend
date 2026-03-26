import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ContactApiService } from '../../../core/services/contact-api';
import { FlashMessageService } from '../../../core/services/flash-message';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faEnvelope, faLocationArrow, faPhone } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-owner-contact',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './owner-contact.html',
  styleUrls: ['./owner-contact.css'],
})
export class OwnerContact {
  faClock = faClock;
  faPhone = faPhone;
  faLocationArrow = faLocationArrow;
  faEnvelope = faEnvelope;

  name = '';
  email = '';
  phone = '';
  subject = '';
  message = '';

  constructor(
    private auth: AuthService,
    private flash: FlashMessageService,
    private contactApi: ContactApiService
  ) {}

  get ctaButtonText(): string {
    return this.hasOwnerSession() ? 'Go to Partner Dashboard' : 'Join Car2Go Partners';
  }

  get ctaButtonLink(): string {
    return this.hasOwnerSession() ? '/owner' : '/owner-login';
  }

  async submitMessage(): Promise<void> {
    const name = this.name.trim();
    const email = this.email.trim().toLowerCase();
    const phone = this.phone.trim();
    const subject = this.subject.trim();
    const message = this.message.trim();

    if (!name || !email || !message) {
      this.flash.showError('Please fill all required fields.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.flash.showError('Please enter a valid email address.');
      return;
    }

    if (phone && !this.validatePhone(phone)) {
      this.flash.showError('Phone number must be 10 digits.');
      return;
    }

    try {
      const response = await this.contactApi.createMessage({
        name,
        email,
        phone,
        subject,
        message,
        senderRole: 'Owner',
      });

      this.flash.showSuccess(response.message || 'Your message has been sent successfully!');
      this.name = '';
      this.email = '';
      this.phone = '';
      this.subject = '';
      this.message = '';
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to send your message.'));
    }
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validatePhone(phone: string): boolean {
    return /^[0-9]{10}$/.test(phone);
  }

  private hasOwnerSession(): boolean {
    const session = this.auth.getSession();
    return !!(
      session &&
      session.userId?.trim() &&
      session.email?.trim() &&
      session.role === 'Owner'
    );
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }
}

