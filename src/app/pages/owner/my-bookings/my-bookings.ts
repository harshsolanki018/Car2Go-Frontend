import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FlashMessageService } from '../../../core/services/flash-message';
import { OwnerApiService } from '../../../core/services/owner-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';
import { triggerDownload } from '../../../shared/utils/download';

interface OwnerBooking {
  id: number;
  bookingId: string;
  carName: string;
  carNumber: string;
  image?: string;
  pickupDate: string;
  returnDate: string;
  totalDays: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pickup Due' | 'Active' | 'Awaiting Return' | 'Completed';
  fullName: string;
  phone: string;
  userEmail: string;
  email?: string;
  alternatePhone?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  aadhaar?: string;
  licenseNumber?: string;
  licenseFront?: string;
  licenseBack?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  rating?: number;
  review?: string;
}

@Component({
  selector: 'app-owner-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SecureUrlPipe],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.css'],
})
export class OwnerBookings implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  bookings: OwnerBooking[] = [];
  searchText = '';
  selectedStatus = 'all';
  expandedBookingIds = new Set<number>();
  pickupCodes: Record<number, string> = {};

  constructor(
    private flash: FlashMessageService,
    private ownerApi: OwnerApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    try {
      const rawBookings = await this.ownerApi.listBookings();
      this.bookings = rawBookings.map((booking: any) => this.normalizeBooking(booking));
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load bookings.'));
    } finally {
      this.refreshView();
    }
  }

  normalizeBooking(booking: any): OwnerBooking {
    return {
      ...booking,
      bookingId: booking.bookingId || `BK-${booking.id || Date.now()}`,
      carNumber: booking.carNumber || 'N/A',
      fullName: booking.fullName || 'N/A',
      phone: booking.phone || 'N/A',
      userEmail: booking.userEmail || 'N/A',
      email: booking.email || booking.userEmail || 'N/A',
      alternatePhone: booking.alternatePhone || '',
      dob: booking.dob || '',
      address: booking.address || '',
      city: booking.city || '',
      state: booking.state || '',
      pincode: booking.pincode || '',
      aadhaar: booking.aadhaar || '',
      licenseNumber: booking.licenseNumber || '',
      licenseFront: booking.licenseFront || '',
      licenseBack: booking.licenseBack || '',
      emergencyName: booking.emergencyName || '',
      emergencyPhone: booking.emergencyPhone || '',
    };
  }

  toggleDetails(bookingId: number): void {
    if (this.expandedBookingIds.has(bookingId)) {
      this.expandedBookingIds.delete(bookingId);
    } else {
      this.expandedBookingIds.add(bookingId);
    }
    this.refreshView();
  }

  isExpanded(bookingId: number): boolean {
    return this.expandedBookingIds.has(bookingId);
  }

  getContactEmail(booking: OwnerBooking): string {
    return booking.email || booking.userEmail || 'N/A';
  }

  downloadFile(dataUrl: string, filename: string): void {
    if (!dataUrl) {
      this.flash.showError('Document not available.');
      return;
    }
    const ok = triggerDownload(dataUrl, filename);
    if (!ok) {
      this.flash.showError('Document not available.');
    }
  }

  async completeBooking(booking: OwnerBooking): Promise<void> {
    try {
      const response = await this.ownerApi.completeBooking(String(booking.id));
      booking.status = response.data?.status || 'Completed';
      this.flash.showSuccess(response.message || 'Booking marked as completed.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to complete booking.'));
    } finally {
      this.refreshView();
    }
  }

  async verifyPickupCode(booking: OwnerBooking): Promise<void> {
    const pickupCode = String(this.pickupCodes[booking.id] || '').trim();
    if (!pickupCode) {
      this.flash.showError('Please enter the pickup code.');
      return;
    }
    try {
      const response = await this.ownerApi.verifyPickupCode(
        String(booking.id),
        pickupCode
      );
      booking.status = response.data?.status || 'Active';
      this.pickupCodes[booking.id] = '';
      this.flash.showSuccess(response.message || 'Pickup verified successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Invalid pickup code.'));
    } finally {
      this.refreshView();
    }
  }

  get filteredBookings(): OwnerBooking[] {
    const search = this.searchText.trim().toLowerCase();
    return this.bookings.filter((booking) => {
      const matchesSearch =
        !search ||
        booking.bookingId?.toLowerCase().includes(search) ||
        booking.carName?.toLowerCase().includes(search) ||
        booking.carNumber?.toLowerCase().includes(search) ||
        booking.fullName?.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' || booking.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
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
