import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlashMessageService } from '../../../core/services/flash-message';
import { AdminApiService } from '../../../core/services/admin-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

const MAX_HOME_CARS = 3;

interface AdminHomeCar {
  id: string;
  name: string;
  carNumber: string;
  image?: string;
  location: string;
  fuelType: string;
  transmission: string;
  pricePerDay: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Blocked';
}

@Component({
  selector: 'app-home-cars',
  standalone: true,
  imports: [CommonModule, FormsModule, SecureUrlPipe],
  templateUrl: './home-cars.html',
})
export class HomeCars implements OnInit {
  cars: AdminHomeCar[] = [];
  featuredIds: string[] = [];

  constructor(
    private flash: FlashMessageService,
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadData();
  }

  get availableCars(): AdminHomeCar[] {
    return this.cars.filter((car) => car.status === 'Approved');
  }

  isSelected(carId: string): boolean {
    return this.featuredIds.includes(carId);
  }

  onSelectionChange(carId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.featuredIds.includes(carId)) {
        if (this.featuredIds.length >= MAX_HOME_CARS) {
          this.flash.showError(`You can select only ${MAX_HOME_CARS} cars for the Home page.`);
          (event.target as HTMLInputElement).checked = false;
          return;
        }
        this.featuredIds.push(carId);
      }
      return;
    }

    this.featuredIds = this.featuredIds.filter((id) => id !== carId);
  }

  async saveSelection(): Promise<void> {
    try {
      const response = await this.adminApi.saveHomeCars(this.featuredIds);
      this.flash.showSuccess(response.message || 'Home featured cars updated.');
      await this.loadData();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to save home cars.'));
    } finally {
      this.refreshView();
    }
  }

  async useAutomaticSelection(): Promise<void> {
    try {
      const response = await this.adminApi.clearHomeCars();
      this.featuredIds = [];
        this.flash.showSuccess(
          response.message ||
            'Manual selection cleared. Home page will show the first 3 approved cars automatically.'
        );
      await this.loadData();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to reset home cars.'));
    } finally {
      this.refreshView();
    }
  }

  private async loadData(): Promise<void> {
    try {
      const payload = await this.adminApi.getHomeCars();
      this.cars = payload.cars || [];
      const selectableIds = new Set(
        this.cars
          .filter((car) => car.status === 'Approved')
          .map((car) => car.id)
      );
      this.featuredIds = Array.isArray(payload.featuredIds)
        ? payload.featuredIds.filter((id) => selectableIds.has(id)).slice(0, MAX_HOME_CARS)
        : [];
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load home cars.'));
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

