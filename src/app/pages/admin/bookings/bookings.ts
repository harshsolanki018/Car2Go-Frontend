import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FlashMessageService } from '../../../core/services/flash-message';
import { AdminApiService } from '../../../core/services/admin-api';
import { BookingsApiService } from '../../../core/services/bookings-api';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './bookings.html',
})
export class Bookings implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  bookings: any[] = [];
  searchText = '';
  selectedStatus = 'all';

  constructor(
    private flash: FlashMessageService,
    private adminApi: AdminApiService,
    private bookingsApi: BookingsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadBookings();
  }

  async loadBookings() {
    try {
      const rawBookings = await this.adminApi.listBookings();
      this.bookings = rawBookings.map((booking: any) => this.normalizeBooking(booking));
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load bookings.'));
    } finally {
      this.refreshView();
    }
  }

  normalizeBooking(booking: any) {
    return {
      ...booking,
      bookingId: booking.bookingId || `BK-${booking.id || Date.now()}`,
      carNumber: booking.carNumber || 'N/A',
      fullName: booking.fullName || 'N/A',
      phone: booking.phone || 'N/A',
      userEmail: booking.userEmail || 'N/A',
      totalAmount:
        booking.totalAmount !== undefined && booking.totalAmount !== null
          ? booking.totalAmount
          : booking.totalPrice,
    };
  }

  get filteredBookings() {
    return this.bookings.filter((b) => {
      const search = this.searchText.toLowerCase();

      const matchesSearch =
        b.bookingId?.toString().toLowerCase().includes(search) ||
        b.userEmail?.toString().toLowerCase().includes(search) ||
        b.phone?.toString().toLowerCase().includes(search) ||
        b.carNumber?.toString().toLowerCase().includes(search);

      const matchesStatus = this.selectedStatus === 'all' || b.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
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
