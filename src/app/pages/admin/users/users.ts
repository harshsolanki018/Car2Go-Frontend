import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { FlashMessageService } from '../../../core/services/flash-message';
import { AdminApiService } from '../../../core/services/admin-api';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  users: any[] = [];
  bookings: any[] = [];
  cars: any[] = [];
  searchText = '';
  roleFilter: string | null = null;
  viewMode: string | null = null;
  pageTitle = 'Manage Users';

  constructor(
    private flash: FlashMessageService,
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const snapshot = this.route.snapshot.queryParamMap;
    this.roleFilter = snapshot.get('role');
    this.viewMode = snapshot.get('view');
    this.updatePageTitle();
    void this.loadData();

    this.route.queryParamMap.subscribe((params) => {
      this.roleFilter = params.get('role');
      this.viewMode = params.get('view');
      this.updatePageTitle();
      void this.loadData();
    });
  }

  async loadData() {
    try {
      const requests = [this.adminApi.listUsers(), this.adminApi.listBookings()];
      if (this.shouldLoadCars()) {
        requests.push(this.adminApi.listCars());
      }
      const [users, bookings, cars] = await Promise.all(requests);
      this.users = users;
      this.bookings = bookings;
      this.cars = cars || [];
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load users.'));
    } finally {
      this.refreshView();
    }
  }

  getUserStats(userEmail: string) {
    const user = this.users.find((u) => u.email === userEmail);
    if (user?.stats) {
      return user.stats;
    }

    const userBookings = this.bookings.filter((b) => b.userEmail === userEmail);
    const totalSpent = userBookings
      .filter((b) => b.status === 'Completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const ratingStats = this.getRatingStats(userBookings);

    return {
      totalBookings: userBookings.length,
      totalSpent,
      ratingAvg: ratingStats.ratingAvg,
      ratingCount: ratingStats.ratingCount,
    };
  }

  getOwnerStats(ownerId: string) {
    const ownerCars = this.cars.filter((car) => car.ownerId === ownerId);
    const ownerBookings = this.bookings.filter((b) => b.ownerId === ownerId);
    const revenue = ownerBookings
      .filter((b) => b.status === 'Completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const ratingStats = this.getRatingStats(ownerBookings);

    return {
      totalCars: ownerCars.length,
      totalBookings: ownerBookings.length,
      revenue,
      ratingAvg: ratingStats.ratingAvg,
      ratingCount: ratingStats.ratingCount,
    };
  }

  async toggleBlock(user: any) {
    try {
      const response = await this.adminApi.toggleUserBlock(user.id);
      user.blocked = !!response.data?.blocked;
      this.flash.showSuccess(
        response.message ||
          (user.blocked ? 'User blocked successfully.' : 'User unblocked successfully.')
      );
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to update user status.'));
    } finally {
      this.refreshView();
    }
  }

  async deleteUser(userEmail: string) {
    const user = this.users.find((u) => u.email === userEmail);
    if (!user?.id) {
      this.flash.showError('User not found.');
      return;
    }

    try {
      const response = await this.adminApi.deleteUser(user.id);
      this.users = this.users.filter((u) => u.email !== userEmail);
      this.flash.showSuccess(response.message || 'User deleted successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to delete user.'));
    } finally {
      this.refreshView();
    }
  }

  get filteredUsers() {
    const search = this.searchText.toLowerCase();
    return this.users.filter((user) => {
      const isUserRole = (user.role || '').toLowerCase() === 'user';
      const matchesSearch =
        user.email.toLowerCase().includes(search) ||
        user.name?.toLowerCase().includes(search) ||
        String(user.id || '').toLowerCase().includes(search);
      return matchesSearch && isUserRole;
    });
  }

  get isOwnerView(): boolean {
    return (this.roleFilter || '').toLowerCase() === 'owner';
  }

  private shouldLoadCars(): boolean {
    return this.isOwnerView || this.viewMode === 'performance';
  }

  private getRatingStats(bookings: any[]) {
    const ratingBookings = bookings.filter((b) => Number(b.rating) > 0);
    const ratingCount = ratingBookings.length;
    const ratingAvg = ratingCount
      ? ratingBookings.reduce((sum, b) => sum + Number(b.rating || 0), 0) / ratingCount
      : 0;
    return {
      ratingAvg: Number(ratingAvg.toFixed(1)),
      ratingCount,
    };
  }

  private updatePageTitle(): void {
    if (this.isOwnerView) {
      if (this.viewMode === 'performance') {
        this.pageTitle = 'Owner Performance Summary';
        return;
      }
      if (this.viewMode === 'verification') {
        this.pageTitle = 'Owner Verification & Status';
        return;
      }
      this.pageTitle = 'Manage Owners';
      return;
    }

    if (this.viewMode === 'activity') {
      this.pageTitle = 'User Activity & Ratings';
      return;
    }

    this.pageTitle = 'Manage Users';
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
