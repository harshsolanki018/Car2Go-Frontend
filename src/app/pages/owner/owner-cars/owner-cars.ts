import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCar,
  faImage,
  faMapPin,
  faGear,
  faMessage,
  faSackDollar,
  faUser,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { FlashMessageService } from '../../../core/services/flash-message';
import { OwnerApiService } from '../../../core/services/owner-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

interface OwnerCar {
  id: string;
  ownerName: string;
  ownerContact: string;
  ownerLicenseFrontImage?: string;
  ownerLicenseBackImage?: string;
  rcBookImage?: string;
  pucCertificateImage?: string;
  ownerEmail: string;
  name: string;
  carNumber: string;
  image?: string;
  state: string;
  city: string;
  area: string;
  location: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  pricePerDay: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Blocked';
}

@Component({
  selector: 'app-owner-cars',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SecureUrlPipe],
  templateUrl: './owner-cars.html',
  styleUrls: ['./owner-cars.css'],
})
export class OwnerCars implements OnInit {
  faUser = faUser;
  faCar = faCar;
  faImage = faImage;
  faMapPin = faMapPin;
  faGear = faGear;
  faSackDollar = faSackDollar;
  faMessage = faMessage;
  faMagnifyingGlass = faMagnifyingGlass;

  searchText = '';
  cars: OwnerCar[] = [];
  showAddModal = false;
  isEditMode = false;
  selectedCarId: string | null = null;
  isSaving = false;
  newCar: OwnerCar = this.getEmptyCar();
  selectedCar: OwnerCar | null = null;
  carImageFile: File | null = null;
  rcBookFile: File | null = null;
  pucFile: File | null = null;
  ownerProfile = {
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseFrontImage: '',
    licenseBackImage: '',
    aadhaarNumber: '',
    address: '',
    gender: '',
    age: '',
  };
  profileLoaded = false;

  constructor(
    private flash: FlashMessageService,
    private ownerApi: OwnerApiService,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredCars(): OwnerCar[] {
    if (!this.searchText.trim()) {
      return this.cars;
    }

    const search = this.searchText.toLowerCase();
    return this.cars.filter((car) => {
      const matchesId = car.id.toString().includes(search);
      const matchesNumber = car.carNumber?.toLowerCase().includes(search);
      const matchesName = car.name?.toLowerCase().includes(search);
      return matchesId || matchesNumber || matchesName;
    });
  }

  ngOnInit(): void {
    void Promise.all([this.loadProfile(), this.loadCars()]);
  }

  async loadCars(): Promise<void> {
    try {
      this.cars = await this.ownerApi.listCars();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load cars.'));
    } finally {
      this.refreshView();
    }
  }

  openAddModal(): void {
    void this.prepareAddModal();
  }

  editCarById(carId: string): void {
    const car = this.cars.find((item) => item.id === carId);
    if (!car) {
      return;
    }

    this.isEditMode = true;
    this.selectedCarId = carId;
    this.newCar = { ...car };
    this.hydrateLocationFields(this.newCar);
    this.carImageFile = null;
    this.rcBookFile = null;
    this.pucFile = null;
    this.showAddModal = true;
    void this.loadCarDetails(carId);
  }

  private async loadCarDetails(carId: string): Promise<void> {
    try {
      const details = await this.ownerApi.getCarById(carId);
      if (!details || this.selectedCarId !== carId) {
        return;
      }
      this.newCar = { ...this.newCar, ...details };
      this.hydrateLocationFields(this.newCar);
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load car details.'));
    } finally {
      this.refreshView();
    }
  }

  openCarDetails(car: OwnerCar): void {
    this.selectedCar = car;
  }

  closeCarDetails(): void {
    this.selectedCar = null;
  }

  async saveCar(form: any): Promise<void> {
    this.normalizeCarFormValues();
    form?.control?.updateValueAndValidity?.();

    if (form.invalid) {
      form.control.markAllAsTouched();
      const formError = this.getFormValidationError(form);
      this.flash.showError(formError || 'Please fill all required fields correctly.');
      return;
    }
    if (!this.isEditMode) {
      if (!this.newCar.ownerLicenseFrontImage || !this.newCar.ownerLicenseBackImage) {
        this.flash.showError('Please upload front and back license images in profile before adding a car.');
        return;
      }
      if (!this.newCar.rcBookImage && !this.rcBookFile) {
        this.flash.showError('Please upload the RC book image.');
        return;
      }
      if (!this.newCar.pucCertificateImage && !this.pucFile) {
        this.flash.showError('Please upload the PUC certificate image.');
        return;
      }
    }
    if (!this.newCar.image && !this.carImageFile) {
      this.flash.showError('Please upload a car image.');
      return;
    }
    const validationError = this.validateCarDetails(this.newCar);
    if (validationError) {
      this.flash.showError(validationError);
      return;
    }

    try {
      this.isSaving = true;
      const payload = this.buildCarFormData();
      if (this.isEditMode && this.selectedCarId !== null) {
        const response = await this.ownerApi.updateCar(this.selectedCarId, payload);
        this.flash.showSuccess(response.message || 'Car updated successfully.');
      } else {
        const response = await this.ownerApi.createCar(payload);
        this.flash.showSuccess(response.message || 'Car added successfully.');
      }

      this.closeModal();
      await this.loadCars();
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to save car.'));
    } finally {
      this.isSaving = false;
      this.refreshView();
    }
  }

  async safeDelete(car: OwnerCar): Promise<void> {
    const confirmed = confirm('Are you sure you want to delete this car?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await this.ownerApi.deleteCar(car.id);
      this.cars = this.cars.filter((item) => item.id !== car.id);
      this.flash.showSuccess(response.message || 'Car deleted successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to delete car.'));
    } finally {
      this.refreshView();
    }
  }

  onImageSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type || !file.type.startsWith('image/')) {
      this.flash.showError('Please upload a valid image file (JPG/PNG).');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.flash.showError('Image must be 2MB or smaller.');
      event.target.value = '';
      return;
    }

    this.carImageFile = file;
    this.newCar.image = URL.createObjectURL(file);
  }

  onRcBookSelect(event: any): void {
    this.handleDocumentSelect(event, 'rcBookImage', 'RC book image');
  }

  onPucSelect(event: any): void {
    this.handleDocumentSelect(event, 'pucCertificateImage', 'PUC certificate image');
  }

  private handleDocumentSelect(
    event: any,
    field: 'rcBookImage' | 'pucCertificateImage',
    label: string
  ): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type || !file.type.startsWith('image/')) {
      this.flash.showError(`Please upload a valid ${label} (JPG/PNG).`);
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.flash.showError(`${label} must be 2MB or smaller.`);
      event.target.value = '';
      return;
    }
    if (field === 'rcBookImage') {
      this.rcBookFile = file;
    } else {
      this.pucFile = file;
    }
    this.newCar[field] = URL.createObjectURL(file);
  }

  closeModal(): void {
    this.showAddModal = false;
    this.selectedCarId = null;
    this.carImageFile = null;
    this.rcBookFile = null;
    this.pucFile = null;
    this.isSaving = false;
  }

  getEmptyCar(): OwnerCar {
    return {
      id: '',
      ownerName: '',
      ownerContact: '',
      ownerLicenseFrontImage: '',
      ownerLicenseBackImage: '',
      rcBookImage: '',
      pucCertificateImage: '',
      ownerEmail: '',
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

  private applyOwnerDefaults(car: OwnerCar): void {
    car.ownerName = this.ownerProfile.name || '';
    car.ownerContact = this.ownerProfile.phone || '';
    car.ownerEmail = this.ownerProfile.email || '';
    car.ownerLicenseFrontImage = this.ownerProfile.licenseFrontImage || '';
    car.ownerLicenseBackImage = this.ownerProfile.licenseBackImage || '';
  }

  private validateCarDetails(car: OwnerCar): string | null {
    const regNumber = String(car.carNumber || '').trim().toUpperCase();
    const regPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!regPattern.test(regNumber)) {
      return 'Registration number must follow format like GJ05VK1818 (10 characters).';
    }

    const seats = Number(car.seats);
    if (!Number.isFinite(seats) || seats < 2 || seats > 20) {
      return 'Seats must be between 2 and 20.';
    }

    const locationPattern = /^[A-Za-z ]+$/;
    if (!car.state.trim() || !locationPattern.test(car.state.trim())) {
      return 'State must contain only letters.';
    }
    if (!car.city.trim() || !locationPattern.test(car.city.trim())) {
      return 'City must contain only letters.';
    }
    if (!car.area.trim() || !locationPattern.test(car.area.trim())) {
      return 'Area must contain only letters.';
    }

    const description = String(car.description || '').trim();
    if (description.length > 300) {
      return 'Car description must be 300 characters or fewer.';
    }

    return null;
  }

  private async loadProfile(): Promise<void> {
    if (this.profileLoaded) {
      return;
    }
    try {
      const data = await this.ownerApi.getProfile();
      this.ownerProfile = {
        name: data?.name || '',
        phone: data?.phone || '',
        email: data?.email || '',
        licenseNumber: data?.licenseNumber || '',
        licenseFrontImage: data?.licenseFrontImage || data?.licenseImage || '',
        licenseBackImage: data?.licenseBackImage || '',
        aadhaarNumber: data?.aadhaarNumber || '',
        address: data?.address || '',
        gender: data?.gender || '',
        age: data?.age ? String(data.age) : '',
      };
      this.profileLoaded = true;
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load profile.'));
    } finally {
      this.refreshView();
    }
  }

  private isProfileComplete(): boolean {
    return (
      !!this.ownerProfile.name.trim() &&
      !!this.ownerProfile.phone.trim() &&
      !!this.ownerProfile.email.trim() &&
      !!this.ownerProfile.licenseNumber.trim() &&
      !!this.ownerProfile.licenseFrontImage.trim() &&
      !!this.ownerProfile.licenseBackImage.trim() &&
      !!this.ownerProfile.aadhaarNumber.trim() &&
      !!this.ownerProfile.address.trim() &&
      !!this.ownerProfile.gender.trim() &&
      !!this.ownerProfile.age.trim()
    );
  }

  private getMissingProfileFields(): string[] {
    const missing: string[] = [];
    if (!this.ownerProfile.name.trim()) missing.push('Name');
    if (!this.ownerProfile.phone.trim()) missing.push('Phone');
    if (!this.ownerProfile.email.trim()) missing.push('Email');
    if (!this.ownerProfile.licenseNumber.trim()) missing.push('License Number');
    if (!this.ownerProfile.licenseFrontImage.trim()) missing.push('License Front Image');
    if (!this.ownerProfile.licenseBackImage.trim()) missing.push('License Back Image');
    if (!this.ownerProfile.aadhaarNumber.trim()) missing.push('Aadhaar Number');
    if (!this.ownerProfile.address.trim()) missing.push('Address');
    if (!this.ownerProfile.gender.trim()) missing.push('Gender');
    if (!this.ownerProfile.age.trim()) missing.push('Age');
    return missing;
  }

  private async prepareAddModal(): Promise<void> {
    await this.loadProfile();
    if (!this.isProfileComplete()) {
      const missing = this.getMissingProfileFields();
      const suffix = missing.length ? ` Missing: ${missing.join(', ')}.` : '';
      this.flash.showError(`Please complete your profile before adding a car.${suffix}`);
      return;
    }

    this.isEditMode = false;
    this.newCar = this.getEmptyCar();
    this.applyOwnerDefaults(this.newCar);
    this.carImageFile = null;
    this.rcBookFile = null;
    this.pucFile = null;
    this.showAddModal = true;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }

  private getFormValidationError(form: any): string | null {
    const controls = form?.controls || {};
    const firstInvalidKey = Object.keys(controls).find((key) => controls[key]?.invalid);
    if (!firstInvalidKey) {
      return null;
    }
    const control = controls[firstInvalidKey];
    const errors = control?.errors || {};

    if (errors.required) {
      const labels: Record<string, string> = {
        ownerName: 'Owner name',
        ownerContact: 'Owner contact number',
        ownerEmail: 'Owner email',
        carName: 'Car name',
        carNumber: 'Registration number',
        state: 'State',
        city: 'City',
        area: 'Area',
        fuelType: 'Fuel type',
        transmission: 'Transmission',
        seats: 'Seats',
        pricePerDay: 'Price per day',
        description: 'Description',
      };
      return `${labels[firstInvalidKey] || 'This field'} is required.`;
    }

    if (errors.email && firstInvalidKey === 'ownerEmail') {
      return 'Please enter a valid owner email address.';
    }

    if (errors.pattern) {
      if (firstInvalidKey === 'carNumber') {
        return 'Registration number must follow format like GJ05VK1818 (10 characters).';
      }
      if (firstInvalidKey === 'ownerContact') {
        return 'Owner contact number must be 10 digits.';
      }
      if (firstInvalidKey === 'state' || firstInvalidKey === 'city' || firstInvalidKey === 'area') {
        return 'State, City, and Area must contain only letters.';
      }
    }

    if (errors.min || errors.max) {
      if (firstInvalidKey === 'seats') {
        return 'Seats must be between 2 and 20.';
      }
      if (firstInvalidKey === 'pricePerDay') {
        return 'Price per day must be at least 1.';
      }
    }

    if (errors.minlength || errors.maxlength) {
      if (firstInvalidKey === 'ownerContact') {
        return 'Owner contact number must be 10 digits.';
      }
      if (firstInvalidKey === 'carNumber') {
        return 'Registration number must be 10 characters.';
      }
    }

    return null;
  }

  private normalizeCarFormValues(): void {
    this.newCar.ownerName = String(this.newCar.ownerName || '').trim();
    this.newCar.ownerContact = String(this.newCar.ownerContact || '')
      .replace(/\D/g, '')
      .slice(0, 10);
    this.newCar.ownerEmail = String(this.newCar.ownerEmail || '').trim().toLowerCase();
    this.newCar.name = String(this.newCar.name || '').trim();
    this.newCar.carNumber = String(this.newCar.carNumber || '')
      .toUpperCase()
      .replace(/\s+/g, '');
    this.newCar.state = String(this.newCar.state || '')
      .trim()
      .replace(/\s+/g, ' ');
    this.newCar.city = String(this.newCar.city || '')
      .trim()
      .replace(/\s+/g, ' ');
    this.newCar.area = String(this.newCar.area || '')
      .trim()
      .replace(/\s+/g, ' ');
    this.newCar.location = this.buildLocationLabel(this.newCar);
    this.newCar.description = String(this.newCar.description || '').trim();
  }

  private buildLocationLabel(car: OwnerCar): string {
    const parts = [car.city, car.area, car.state]
      .map((part) => String(part || '').trim())
      .filter(Boolean);
    return parts.join(', ');
  }

  private hydrateLocationFields(car: OwnerCar): void {
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

  private buildCarFormData(): FormData {
    const formData = new FormData();
    formData.append('ownerName', String(this.newCar.ownerName || '').trim());
    formData.append('ownerContact', String(this.newCar.ownerContact || '').trim());
    formData.append('ownerEmail', String(this.newCar.ownerEmail || '').trim());
    formData.append('name', String(this.newCar.name || '').trim());
    formData.append('carNumber', String(this.newCar.carNumber || '').trim());
    formData.append('state', String(this.newCar.state || '').trim());
    formData.append('city', String(this.newCar.city || '').trim());
    formData.append('area', String(this.newCar.area || '').trim());
    formData.append('location', String(this.newCar.location || '').trim());
    formData.append('fuelType', String(this.newCar.fuelType || '').trim());
    formData.append('transmission', String(this.newCar.transmission || '').trim());
    formData.append('seats', String(this.newCar.seats ?? ''));
    formData.append('pricePerDay', String(this.newCar.pricePerDay ?? ''));
    formData.append('description', String(this.newCar.description || '').trim());
    if (this.carImageFile) {
      formData.append('image', this.carImageFile);
    }
    if (this.rcBookFile) {
      formData.append('rcBookImage', this.rcBookFile);
    }
    if (this.pucFile) {
      formData.append('pucCertificateImage', this.pucFile);
    }
    return formData;
  }

}



