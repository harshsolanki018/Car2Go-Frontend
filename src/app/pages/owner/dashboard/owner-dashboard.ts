import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashMessageService } from '../../../core/services/flash-message';
import { OwnerApiService } from '../../../core/services/owner-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

interface OwnerCarSummary {
  id: string;
  name: string;
  carNumber: string;
  image?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Blocked';
}

interface OwnerBookingSummary {
  id: number;
  bookingId: string;
  carId: string;
  carName: string;
  carNumber: string;
  totalPrice: number;
  totalAmount?: number;
  ownerEarnings?: number;
  ownerPayoutPaid?: boolean;
  status: 'Confirmed' | 'Pickup Due' | 'Active' | 'Awaiting Return' | 'Completed';
  rating?: number;
  createdAt?: string;
  pickupDate: string;
  returnDate: string;
  fullName?: string;
}

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SecureUrlPipe],
  templateUrl: './owner-dashboard.html',
  styleUrls: ['./owner-dashboard.css'],
})
export class OwnerDashboard implements OnInit {
  rangeOptions = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '365d', label: '1 Year' },
    { key: 'overall', label: 'Overall' },
  ];
  selectedRange = '7d';
  rangeStartDisplay = '';
  rangeEndDisplay = '';

  stats: Array<{ label: string; value: string | number; note?: string }> = [];
  recentBookings: OwnerBookingSummary[] = [];
  topCars: Array<{
    id: string;
    name: string;
    carNumber: string;
    image?: string;
    bookings: number;
    revenue: number;
    avgRating: number;
  }> = [];
  monthOptions: Array<{ key: string; label: string }> = [];
  selectedMonth = 'overall';
  earningsSummary = {
    total: 0,
    paid: 0,
    unpaid: 0,
    lastPayoutDate: '-',
  };
  payoutHistory: Array<{
    payoutId: string;
    amountPaid: number;
    bookingCount: number;
    paidAt: string;
  }> = [];
  filteredPayoutHistory: Array<{
    payoutId: string;
    amountPaid: number;
    bookingCount: number;
    paidAt: string;
  }> = [];
  private allCars: OwnerCarSummary[] = [];
  private allBookings: OwnerBookingSummary[] = [];

  constructor(
    private ownerApi: OwnerApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.monthOptions = this.buildMonthOptions();
    void this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    try {
      const [cars, bookings, payouts] = await Promise.all([
        this.ownerApi.listCars(),
        this.ownerApi.listBookings(),
        this.ownerApi.listPayouts(),
      ]);

      const normalizedCars: OwnerCarSummary[] = (cars || []).map((car: any) => ({
        id: String(car.id || ''),
        name: car.name || 'N/A',
        carNumber: car.carNumber || 'N/A',
        image: car.image || '',
        status: car.status || 'Pending',
      }));

      const normalizedBookings: OwnerBookingSummary[] = (bookings || []).map(
        (booking: any) => ({
          id: Number(booking.id || 0),
          bookingId: booking.bookingId || `BK-${booking.id || Date.now()}`,
          carId: String(booking.carId || ''),
          carName: booking.carName || 'N/A',
          carNumber: booking.carNumber || 'N/A',
          totalPrice: Number(booking.totalPrice || 0),
          totalAmount: Number(booking.totalAmount || 0),
          ownerEarnings: Number(booking.ownerEarnings || 0),
          ownerPayoutPaid: Boolean(booking.ownerPayoutPaid),
          status: booking.status || 'Confirmed',
          rating: Number(booking.rating || 0),
          createdAt: booking.createdAt || '',
          pickupDate: booking.pickupDate || '',
          returnDate: booking.returnDate || '',
          fullName: booking.fullName || 'N/A',
        })
      );

      const normalizedPayouts = (payouts || [])
        .map((payout: any) => ({
          payoutId: payout.payoutId || String(payout.id || ''),
          amountPaid: Number(payout.amountPaid || 0),
          bookingCount: Number(payout.bookingCount || 0),
          paidAt: payout.paidAt || payout.createdAt || '',
        }))
        .sort((a, b) => {
          const aTime = a.paidAt ? new Date(a.paidAt).getTime() : 0;
          const bTime = b.paidAt ? new Date(b.paidAt).getTime() : 0;
          return bTime - aTime;
        });

      this.allCars = normalizedCars;
      this.allBookings = normalizedBookings;
      this.payoutHistory = normalizedPayouts;
      this.applyRange();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load dashboard.'));
    } finally {
      this.refreshView();
    }
  }

  setRange(rangeKey: string): void {
    this.selectedRange = rangeKey;
    this.applyRange();
  }

  setMonth(monthKey: string): void {
    this.selectedMonth = monthKey;
    this.applyMonthFilter();
  }

  private applyRange(): void {
    const { start, end } = this.getSelectedRange();
    if (this.selectedRange === 'overall') {
      this.rangeStartDisplay = 'All time';
      this.rangeEndDisplay = this.formatDate(end);
    } else {
      this.rangeStartDisplay = this.formatDate(start);
      this.rangeEndDisplay = this.formatDate(end);
    }
    const filteredBookings = this.filterBookingsByRange(
      this.allBookings,
      start,
      end
    );

    this.buildStats(this.allCars, filteredBookings);
    this.recentBookings = this.buildRecentBookings(filteredBookings);
    this.topCars = this.buildTopCars(this.allCars, filteredBookings);
    this.applyMonthFilter();
    this.refreshView();
  }

  private getSelectedRange(): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);

    switch (this.selectedRange) {
      case '30d':
        start.setDate(start.getDate() - 29);
        break;
      case '365d':
        start.setDate(start.getDate() - 364);
        break;
      case 'overall':
        start.setTime(0);
        break;
      default:
        start.setDate(start.getDate() - 6);
        break;
    }

    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  private filterBookingsByRange(
    bookings: OwnerBookingSummary[],
    start: Date,
    end: Date
  ): OwnerBookingSummary[] {
    return bookings.filter((booking) => {
      const dateValue = this.getBookingDate(booking);
      if (!dateValue) {
        return false;
      }
      return dateValue >= start.getTime() && dateValue <= end.getTime();
    });
  }

  private getBookingDate(booking: OwnerBookingSummary): number | null {
    const raw = booking.createdAt || booking.pickupDate;
    if (!raw) {
      return null;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.getTime();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private buildStats(
    cars: OwnerCarSummary[],
    bookings: OwnerBookingSummary[]
  ): void {
    const totalCars = cars.length;
    const approvedCars = cars.filter((car) => car.status === 'Approved').length;
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(
      (b) => b.status === 'Active' || b.status === 'Awaiting Return'
    ).length;
    const completedBookings = bookings.filter((b) => b.status === 'Completed').length;

    const ratings = bookings.filter((b) => (b.rating || 0) > 0);
    const avgRating = ratings.length
      ? ratings.reduce((sum, b) => sum + Number(b.rating || 0), 0) / ratings.length
      : 0;

    this.stats = [
      {
        label: 'Total Cars',
        value: totalCars,
        note: `${approvedCars} approved`,
      },
      {
        label: 'Total Bookings',
        value: totalBookings,
        note: `${completedBookings} completed`,
      },
      {
        label: 'Active Trips',
        value: activeBookings,
      },
      {
        label: 'Avg Rating',
        value: avgRating ? avgRating.toFixed(1) : 'N/A',
      },
    ];
  }

  private buildRecentBookings(
    bookings: OwnerBookingSummary[]
  ): OwnerBookingSummary[] {
    return [...bookings]
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return bDate - aDate;
      })
      .slice(0, 5);
  }

  private buildTopCars(
    cars: OwnerCarSummary[],
    bookings: OwnerBookingSummary[]
  ): Array<{
    id: string;
    name: string;
    carNumber: string;
    image?: string;
    bookings: number;
    revenue: number;
    avgRating: number;
  }> {
    const carLookup = new Map(cars.map((car) => [car.id, car]));
    const stats = new Map<
      string,
      { bookings: number; revenue: number; ratingSum: number; ratingCount: number }
    >();

    bookings.forEach((booking) => {
      const key = booking.carId || booking.carName;
      if (!stats.has(key)) {
        stats.set(key, { bookings: 0, revenue: 0, ratingSum: 0, ratingCount: 0 });
      }
      const current = stats.get(key)!;
      current.bookings += 1;
      current.revenue += this.getOwnerEarning(booking);
      if ((booking.rating || 0) > 0) {
        current.ratingSum += Number(booking.rating || 0);
        current.ratingCount += 1;
      }
    });

    return Array.from(stats.entries())
      .map(([key, value]) => {
        const car = carLookup.get(key);
        const avgRating = value.ratingCount
          ? value.ratingSum / value.ratingCount
          : 0;
        return {
          id: key,
          name: car?.name || 'N/A',
          carNumber: car?.carNumber || 'N/A',
          image: car?.image || '',
          bookings: value.bookings,
          revenue: value.revenue,
          avgRating,
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }

  private applyMonthFilter(): void {
    const filteredBookings =
      this.selectedMonth === 'overall'
        ? this.allBookings
        : this.allBookings.filter((booking) =>
            this.isInMonth(this.getBookingDate(booking), this.selectedMonth)
          );

    const filteredPayouts =
      this.selectedMonth === 'overall'
        ? this.payoutHistory
        : this.payoutHistory.filter((payout) =>
            this.isInMonth(payout.paidAt, this.selectedMonth)
          );

    const completedBookings = filteredBookings.filter(
      (booking) => booking.status === 'Completed'
    );

    const earnings = completedBookings.reduce(
      (acc, booking) => {
        const earning = this.getOwnerEarning(booking);
        acc.total += earning;
        if (booking.ownerPayoutPaid) {
          acc.paid += earning;
        } else {
          acc.unpaid += earning;
        }
        return acc;
      },
      { total: 0, paid: 0, unpaid: 0 }
    );

    const lastPayout = filteredPayouts[0]?.paidAt
      ? this.formatDate(new Date(filteredPayouts[0].paidAt))
      : '-';

    this.earningsSummary = {
      total: earnings.total,
      paid: earnings.paid,
      unpaid: earnings.unpaid,
      lastPayoutDate: lastPayout,
    };

    this.filteredPayoutHistory = filteredPayouts;
  }

  getOwnerEarning(booking: OwnerBookingSummary): number {
    const earning = Number(booking.ownerEarnings);
    if (Number.isFinite(earning) && earning > 0) {
      return earning;
    }
    const baseAmount = Number(booking.totalPrice || 0);
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      return 0;
    }
    const commission = baseAmount * 0.15;
    const gstOnCommission = commission * 0.18;
    return baseAmount - commission - gstOnCommission;
  }

  private buildMonthOptions(): Array<{ key: string; label: string }> {
    const options: Array<{ key: string; label: string }> = [
      { key: 'overall', label: 'Overall' },
    ];
    const now = new Date();
    for (let i = 0; i < 12; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      options.push({ key, label });
    }
    return options;
  }

  private isInMonth(value: string | number | Date | null | undefined, monthKey: string): boolean {
    if (!value || !monthKey || monthKey === 'overall') {
      return true;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return key === monthKey;
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
