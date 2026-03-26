import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FlashMessageService } from '../../../core/services/flash-message';
import { AdminApiService } from '../../../core/services/admin-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SecureUrlPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  stats: any[] = [];
  carStats: any[] = [];
  overallRating = 0;
  companyEarningsDisplay = 'Rs. 0';

  constructor(
    private adminApi: AdminApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      const payload = await this.adminApi.getDashboard();
      this.stats = payload?.stats || [];
      this.carStats = payload?.carStats || [];
      this.overallRating = payload?.overallRating || 0;
      this.companyEarningsDisplay = payload?.companyEarningsDisplay || 'Rs. 0';
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load dashboard.'));
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
