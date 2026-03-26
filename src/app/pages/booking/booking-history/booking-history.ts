import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { FlashMessageService } from '../../../core/services/flash-message';
import { BookingsApiService } from '../../../core/services/bookings-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SecureUrlPipe],
  templateUrl: './booking-history.html',
})
export class BookingHistory implements OnInit {
  bookings: any[] = [];
  ratingModalOpen = false;
  ratingBooking: any | null = null;
  ratingValue = 0;
  ratingReview = '';
  ratingSubmitting = false;
  readonly ratingMaxLength = 100;

  constructor(
    private auth: AuthService,
    private flash: FlashMessageService,
    private bookingsApi: BookingsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.refreshUserBookings();
  }

  openRatingModal(booking: any) {
    this.ratingBooking = booking;
    this.ratingValue = 0;
    this.ratingReview = '';
    this.ratingModalOpen = true;
  }

  closeRatingModal() {
    this.ratingModalOpen = false;
    this.ratingBooking = null;
  }

  setRating(value: number) {
    this.ratingValue = value;
  }

  async submitRating() {
    if (!this.ratingBooking) {
      return;
    }
    if (!this.ratingValue || this.ratingValue < 1 || this.ratingValue > 5) {
      this.flash.showError('Please select a star rating.');
      return;
    }

    const review = this.ratingReview.trim();
    if (review.length > this.ratingMaxLength) {
      this.flash.showError('Review must be 100 characters or fewer.');
      return;
    }

    try {
      this.ratingSubmitting = true;
      const response = await this.bookingsApi.rateMyBooking(
        Number(this.ratingBooking.id),
        this.ratingValue,
        review
      );
      this.ratingBooking.rating = response.data?.rating || this.ratingValue;
      this.ratingBooking.review = response.data?.review || review;
      this.flash.showSuccess(response.message || 'Thanks for your rating.');
      this.closeRatingModal();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to submit rating.'));
    } finally {
      this.ratingSubmitting = false;
      this.refreshView();
    }
  }

  async downloadInvoice(booking: any) {
    try {
      const invoiceBlob = await this.bookingsApi.downloadInvoice(Number(booking.id));
      const url = window.URL.createObjectURL(invoiceBlob);
      const link = document.createElement('a');
      const fileId = booking.bookingId || `BK-${booking.id || Date.now()}`;
      link.href = url;
      link.download = `Car2Go_Invoice_${fileId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to download invoice.'));
    }
  }

  async refreshUserBookings() {
    const session = this.auth.getSession();
    if (!session) {
      this.bookings = [];
      this.refreshView();
      return;
    }

    try {
      this.bookings = await this.bookingsApi.getMyBookings();
    } catch (error) {
      this.bookings = [];
      this.flash.showError(this.getErrorMessage(error, 'Failed to load bookings.'));
    } finally {
      this.refreshView();
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }

  private refreshView(): void {
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
