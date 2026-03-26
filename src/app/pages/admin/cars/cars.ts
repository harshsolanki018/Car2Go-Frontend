import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FlashMessageService } from '../../../core/services/flash-message';
import { AdminApiService } from '../../../core/services/admin-api';
import {
  faUser,
  faCar,
  faImage,
  faMapPin,
  faGear,
  faSackDollar,
  faMessage,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { buildDownloadUrl } from '../../../shared/utils/download';

interface AdminCar {
  id: string;
  ownerName: string;
  ownerContact: string;
  ownerLicenseImage?: string;
  rcBookImage?: string;
  pucCertificateImage?: string;
  name: string;
  carNumber: string;
  image?: string;
  createdAt?: string;
  state: string;
  city: string;
  area: string;
  location: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  pricePerDay: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Blocked' | 'Maintenance';
}

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './cars.html',
})
export class Cars implements OnInit {
  faUser = faUser;
  faCar = faCar;
  faImage = faImage;
  faMapPin = faMapPin;
  faGear = faGear;
  faSackDollar = faSackDollar;
  faMessage = faMessage;
  faMagnifyingGlass = faMagnifyingGlass;
  searchText = '';
  selectedStatus = 'all';

  cars: AdminCar[] = [];

  showAddModal = false;
  isViewMode = false;
  selectedCarId: string | null = null;

  newCar: AdminCar = this.getEmptyCar();

  constructor(
    private flash: FlashMessageService,
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredCars() {
    const search = this.searchText.trim().toLowerCase();
    return this.cars.filter((car) => {
      const matchesSearch = !search
        ? true
        : car.id.toString().includes(search) ||
          car.carNumber?.toLowerCase().includes(search) ||
          car.name?.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ? true : car.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  ngOnInit(): void {
    void this.loadCars();
  }

  async loadCars() {
    try {
      this.cars = await this.adminApi.listCars();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load cars.'));
    } finally {
      this.refreshView();
    }
  }

  viewCarById(carId: string) {
    const car = this.cars.find((c) => c.id === carId);
    if (!car) {
      return;
    }

    this.isViewMode = true;
    this.selectedCarId = carId;
    this.newCar = { ...car };
    this.hydrateLocationFields(this.newCar);
    this.showAddModal = true;
  }

  getDownloadUrl(url: string, filename: string): string {
    return buildDownloadUrl(url, filename);
  }

  async approveCar(car: AdminCar): Promise<void> {
    try {
      const response = await this.adminApi.approveCar(car.id);
      car.status = response.data?.status || 'Approved';
      this.flash.showSuccess(response.message || 'Car approved successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to approve car.'));
    } finally {
      this.refreshView();
    }
  }

  async rejectCar(car: AdminCar): Promise<void> {
    try {
      const response = await this.adminApi.rejectCar(car.id);
      car.status = response.data?.status || 'Rejected';
      this.flash.showSuccess(response.message || 'Car rejected.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to reject car.'));
    } finally {
      this.refreshView();
    }
  }

  async blockCar(car: AdminCar): Promise<void> {
    try {
      const response = await this.adminApi.blockCar(car.id);
      car.status = response.data?.status || 'Blocked';
      this.flash.showSuccess(response.message || 'Car blocked.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to block car.'));
    } finally {
      this.refreshView();
    }
  }

  async unblockCar(car: AdminCar): Promise<void> {
    try {
      const response = await this.adminApi.unblockCar(car.id);
      car.status = response.data?.status || 'Approved';
      this.flash.showSuccess(response.message || 'Car unblocked.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to unblock car.'));
    } finally {
      this.refreshView();
    }
  }
  async safeDelete(car: AdminCar) {
    const confirmed = confirm('Are you sure you want to delete this car?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await this.adminApi.deleteCar(car.id);
      this.cars = this.cars.filter((c) => c.id !== car.id);
      this.flash.showSuccess(response.message || 'Car deleted successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to delete car.'));
    } finally {
      this.refreshView();
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.selectedCarId = null;
    this.isViewMode = false;
  }

  getEmptyCar(): AdminCar {
    return {
      id: '',
      ownerName: '',
      ownerContact: '',
      name: '',
      carNumber: '',
      image: '',
      state: '',
      city: '',
      area: '',
      location: '',
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: 4,
      pricePerDay: 0,
      description: '',
      status: 'Pending',
    };
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }

  private hydrateLocationFields(car: AdminCar): void {
    if (car.state || car.city || car.area) {
      return;
    }
    const location = String(car.location || '').trim();
    if (!location) {
      return;
    }
    const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      car.city = parts[0] || '';
      car.area = parts[1] || '';
      if (parts.length >= 3) {
        car.state = parts.slice(2).join(', ');
      }
    }
  }

  private refreshView(): void {
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}



