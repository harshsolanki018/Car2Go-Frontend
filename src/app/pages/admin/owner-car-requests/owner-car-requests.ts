import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AdminApiService } from '../../../core/services/admin-api';
import { FlashMessageService } from '../../../core/services/flash-message';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

@Component({
  selector: 'app-owner-car-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, SecureUrlPipe, FontAwesomeModule],
  templateUrl: './owner-car-requests.html',
  styleUrls: ['./owner-car-requests.css'],
})
export class OwnerCarRequests implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  requests: any[] = [];
  searchText = '';
  selectedRequest: any | null = null;
  showDetailsModal = false;

  constructor(
    private adminApi: AdminApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadRequests();
  }

  async loadRequests(): Promise<void> {
    try {
      const cars = await this.adminApi.listCars();
      const allowedStatuses = ['pending', 'approved', 'rejected'];
      this.requests = cars.filter((car) =>
        allowedStatuses.includes(
          String(car.approvalStatus || car.status || '').toLowerCase()
        )
      );
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load car requests.'));
    } finally {
      this.refreshView();
    }
  }

  get filteredRequests(): any[] {
    const search = this.searchText.toLowerCase();
    return this.requests.filter((car) => {
      const id = String(car.id || '').toLowerCase();
      const number = String(car.carNumber || '').toLowerCase();
      const name = String(car.name || '').toLowerCase();
      const owner = String(car.ownerName || '').toLowerCase();
      return id.includes(search) || number.includes(search) || name.includes(search) || owner.includes(search);
    });
  }

  async approveRequest(car: any): Promise<void> {
    try {
      const response = await this.adminApi.approveCar(car.id);
      car.status = response.data?.status || 'Approved';
      this.flash.showSuccess(response.message || 'Car approved successfully.');
      await this.loadRequests();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to approve car.'));
    } finally {
      this.refreshView();
    }
  }

  async rejectRequest(car: any): Promise<void> {
    try {
      const response = await this.adminApi.rejectCar(car.id);
      car.status = response.data?.status || 'Rejected';
      this.flash.showSuccess(response.message || 'Car rejected.');
      await this.loadRequests();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to reject car.'));
    } finally {
      this.refreshView();
    }
  }

  openDetails(car: any): void {
    this.selectedRequest = car;
    this.showDetailsModal = true;
    this.refreshView();
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedRequest = null;
    this.refreshView();
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
