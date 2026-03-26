import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth';
import { FlashMessageService } from '../../core/services/flash-message';
import { ContactApiService } from '../../core/services/contact-api';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {
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
    return this.hasValidSession() ? 'Explore Cars' : 'Login to Explore Cars';
  }

  get ctaButtonLink(): string {
    return this.hasValidSession() ? '/cars' : '/login';
  }

  async submitMessage() {
    const name = this.name.trim();
    const email = this.email.trim().toLowerCase();
    const phone = this.phone.trim();
    const message = this.message.trim();
    const subject = this.subject.trim();

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
        senderRole: 'User',
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
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private validatePhone(phone: string): boolean {
    return /^[0-9]{10}$/.test(phone);
  }

  private hasValidSession(): boolean {
    const session = this.auth.getSession();
    return !!(
      session &&
      session.userId?.trim() &&
      session.email?.trim() &&
      session.role?.trim()
    );
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }
}
