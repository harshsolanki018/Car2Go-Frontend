import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AdminApiService } from '../../../core/services/admin-api';
import { FlashMessageService } from '../../../core/services/flash-message';

@Component({
  selector: 'app-owner-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './owner-performance.html',
  styleUrls: ['./owner-performance.css'],
})
export class OwnerPerformance implements OnInit, AfterViewInit {
  faMagnifyingGlass = faMagnifyingGlass;
  owners: any[] = [];
  bookings: any[] = [];
  cars: any[] = [];
  searchText = '';
  payoutLoading = new Set<string>();
  monthOptions: Array<{ key: string; label: string }> = [];
  selectedMonth = 'overall';
  private isLoading = false;
  private hasLoadedOnce = false;
  showPayConfirm = false;
  pendingOwner: any | null = null;

  constructor(
    private adminApi: AdminApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.monthOptions = this.buildMonthOptions(6);
    void this.loadData();
  }

  ngAfterViewInit(): void {
    if (!this.hasLoadedOnce && !this.isLoading) {
      setTimeout(() => {
        if (!this.hasLoadedOnce) {
          void this.loadData();
        }
      }, 0);
    }
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      const [users, bookings, cars] = await Promise.all([
        this.adminApi.listUsers(),
        this.adminApi.listBookings(),
        this.adminApi.listCars(),
      ]);
      this.owners = users.filter((user) => (user.role || '').toLowerCase() === 'owner');
      this.bookings = bookings;
      this.cars = cars;
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load owner performance.'));
    } finally {
      this.isLoading = false;
      this.hasLoadedOnce = true;
      this.refreshView();
    }
  }

  get filteredOwners(): any[] {
    const search = this.searchText.toLowerCase();
    return this.owners.filter((owner) => {
      const name = String(owner.name || '').toLowerCase();
      const email = String(owner.email || '').toLowerCase();
      const id = String(owner.id || '').toLowerCase();
      return name.includes(search) || email.includes(search) || id.includes(search);
    });
  }

  getOwnerStats(ownerId: string) {
    const ownerCars = this.cars.filter((car) => car.ownerId === ownerId);
    const ownerBookings = this.filterBookingsByMonth(
      this.bookings.filter((b) => b.ownerId === ownerId)
    );
    const completedBookings = ownerBookings.filter((b) => b.status === 'Completed');
    const totalRevenue = ownerBookings.reduce((sum, b) => sum + this.getBaseAmount(b), 0);
    const unpaidEarnings = completedBookings
      .filter((b) => !b.ownerPayoutPaid)
      .reduce((sum, b) => sum + this.getOwnerEarning(b), 0);
    const ratingBookings = ownerBookings.filter((b) => Number(b.rating) > 0);
    const ratingCount = ratingBookings.length;
    const ratingAvg = ratingCount
      ? ratingBookings.reduce((sum, b) => sum + Number(b.rating || 0), 0) / ratingCount
      : 0;
    const paidBookings = completedBookings.filter(
      (b) => b.ownerPayoutPaid && b.ownerPaidAt
    );
    const lastPayoutTime = paidBookings
      .map((b) => new Date(b.ownerPaidAt).getTime())
      .filter((t) => Number.isFinite(t))
      .sort((a, b) => b - a)[0];
    const lastBatchId = lastPayoutTime
      ? paidBookings.find((b) => new Date(b.ownerPaidAt).getTime() === lastPayoutTime)
          ?.ownerPayoutBatchId
      : '';
    const lastPaidAmount = lastPayoutTime
      ? paidBookings
          .filter((b) =>
            lastBatchId
              ? b.ownerPayoutBatchId === lastBatchId
              : new Date(b.ownerPaidAt).getTime() === lastPayoutTime
          )
          .reduce((sum, b) => sum + this.getOwnerEarning(b), 0)
      : 0;
    const lastPayoutDate = lastPayoutTime
      ? new Date(lastPayoutTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

    return {
      totalCars: ownerCars.length,
      completedBookings: completedBookings.length,
      totalRevenue,
      unpaidEarnings,
      ratingAvg: Number(ratingAvg.toFixed(1)),
      lastPayoutDate,
      lastPaidAmount,
    };
  }

  isPaying(ownerId: string): boolean {
    return this.payoutLoading.has(ownerId);
  }

  openPayModal(owner: any): void {
    if (!owner || !owner.id) {
      return;
    }
    const stats = this.getOwnerStats(owner.id);
    if (stats.unpaidEarnings <= 0 || this.isPaying(owner.id)) {
      return;
    }
    this.pendingOwner = owner;
    this.showPayConfirm = true;
    this.refreshView();
  }

  closePayModal(): void {
    this.showPayConfirm = false;
    this.pendingOwner = null;
    this.refreshView();
  }

  async confirmPayOwner(): Promise<void> {
    const ownerId = this.pendingOwner?.id;
    if (!ownerId || this.isPaying(ownerId)) {
      this.closePayModal();
      return;
    }
    this.closePayModal();
    await this.payOwner(ownerId);
  }

  private async payOwner(ownerId: string): Promise<void> {
    if (!ownerId || this.isPaying(ownerId)) {
      return;
    }
    this.payoutLoading.add(ownerId);
    this.refreshView();
    try {
      const response = await this.adminApi.markOwnerPayoutsPaid(ownerId);
      const payout = response?.data?.payout;
      const paidAt = payout?.paidAt ? new Date(payout.paidAt).toISOString() : new Date().toISOString();
      const batchId = payout?.payoutId || '';
      this.bookings = this.bookings.map((booking) => {
        if (
          booking.ownerId === ownerId &&
          booking.status === 'Completed' &&
          !booking.ownerPayoutPaid
        ) {
          return {
            ...booking,
            ownerPayoutPaid: true,
            ownerPaidAt: paidAt,
            ownerPayoutBatchId: batchId,
          };
        }
        return booking;
      });
      this.flash.showSuccess(response?.message || 'Owner payouts marked as paid.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to mark payouts as paid.'));
    } finally {
      this.payoutLoading.delete(ownerId);
      this.refreshView();
    }
  }

  private getOwnerEarning(booking: any): number {
    const stored = Number(booking.ownerEarnings);
    if (Number.isFinite(stored) && stored > 0) {
      return stored;
    }
    const baseAmount = Number(booking.totalPrice || 0);
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      return 0;
    }
    const commission = baseAmount * 0.15;
    const gstOnCommission = commission * 0.18;
    return baseAmount - commission - gstOnCommission;
  }

  private getBaseAmount(booking: any): number {
    const baseAmount = Number(booking.totalPrice || 0);
    if (Number.isFinite(baseAmount) && baseAmount > 0) {
      return baseAmount;
    }
    const totalAmount = Number(booking.totalAmount);
    if (Number.isFinite(totalAmount) && totalAmount > 0) {
      return totalAmount;
    }
    return 0;
  }

  private buildMonthOptions(months: number): Array<{ key: string; label: string }> {
    const options: Array<{ key: string; label: string }> = [
      { key: 'overall', label: 'Overall' },
    ];
    const now = new Date();
    for (let i = 0; i < months; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      options.push({ key, label });
    }
    return options;
  }

  setMonth(monthKey: string): void {
    this.selectedMonth = monthKey;
    this.refreshView();
  }

  private filterBookingsByMonth(bookings: any[]): any[] {
    if (this.selectedMonth === 'overall') {
      return bookings;
    }
    return bookings.filter((booking) => {
      const date = this.getBookingDate(booking);
      if (!date) {
        return false;
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === this.selectedMonth;
    });
  }

  private getBookingDate(booking: any): Date | null {
    const raw = booking.createdAt || booking.pickupDate;
    if (!raw) {
      return null;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
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
