import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AdminApiService } from '../../../core/services/admin-api';
import { FlashMessageService } from '../../../core/services/flash-message';

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './user-activity.html',
  styleUrls: ['./user-activity.css'],
})
export class UserActivity implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  users: any[] = [];
  bookings: any[] = [];
  searchText = '';

  constructor(
    private adminApi: AdminApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const [users, bookings] = await Promise.all([
        this.adminApi.listUsers(),
        this.adminApi.listBookings(),
      ]);
      this.users = users.filter((user) => (user.role || '').toLowerCase() === 'user');
      this.bookings = bookings;
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load user activity.'));
    } finally {
      this.refreshView();
    }
  }

  get filteredUsers(): any[] {
    const search = this.searchText.toLowerCase();
    return this.users.filter((user) => {
      const name = String(user.name || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      const id = String(user.id || '').toLowerCase();
      return name.includes(search) || email.includes(search) || id.includes(search);
    });
  }

  getUserBookings(email: string): any[] {
    return this.bookings.filter((booking) => booking.userEmail === email);
  }

  getUserStats(email: string) {
    const userBookings = this.getUserBookings(email);
    const completedBookings = userBookings.filter((b) => b.status === 'Completed');
    const totalSpent = userBookings.reduce((sum, b) => {
      const totalAmount = Number(b.totalAmount);
      const amount =
        Number.isFinite(totalAmount) && totalAmount > 0
          ? totalAmount
          : Number(b.totalPrice || 0);
      return sum + amount;
    }, 0);
    const ratingBookings = userBookings.filter((b) => Number(b.rating) > 0);
    const ratingCount = ratingBookings.length;
    const ratingAvg = ratingCount
      ? ratingBookings.reduce((sum, b) => sum + Number(b.rating || 0), 0) / ratingCount
      : 0;

    return {
      totalBookings: userBookings.length,
      completedBookings: completedBookings.length,
      totalSpent: Math.round(totalSpent),
      ratingCount,
      ratingAvg: Number(ratingAvg.toFixed(1)),
    };
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
