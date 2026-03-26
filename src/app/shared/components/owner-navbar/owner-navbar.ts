import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { FlashMessageService } from '../../../core/services/flash-message';
import { OwnerApiService } from '../../../core/services/owner-api';
import { buildDownloadUrl } from '../../utils/download';

@Component({
  selector: 'app-owner-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './owner-navbar.html',
  styleUrls: ['./owner-navbar.css'],
})
export class OwnerNavbar {
  mobileMenuOpen = false;
  profileModalOpen = false;
  profileEditMode = false;
  showLogoutModal = false;
  profileLoaded = false;
  profileSaving = false;
  licenseFrontFile: File | null = null;
  licenseBackFile: File | null = null;
  profileForm = {
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

  constructor(
    public auth: AuthService,
    private ownerApi: OwnerApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.resetProfileForm();
    if (this.isOwnerLoggedIn()) {
      void this.loadProfile(true);
    }
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobile(): void {
    this.mobileMenuOpen = false;
  }

  getUserInitial(): string {
    const name = this.auth.getUser()?.name || '';
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  isOwnerLoggedIn(): boolean {
    return this.auth.isLoggedIn() && this.auth.getRole() === 'Owner';
  }

  confirmLogout(): void {
    if (!this.isOwnerLoggedIn()) {
      void this.auth.logout('/owner');
      return;
    }

    this.showLogoutModal = true;
    this.profileModalOpen = false;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  async proceedLogout(): Promise<void> {
    await this.auth.logout('/owner');
    this.showLogoutModal = false;
    this.profileModalOpen = false;
    this.mobileMenuOpen = false;
    this.resetProfileForm();
    this.profileLoaded = false;
  }

  openProfileModal(): void {
    this.profileModalOpen = true;
    this.profileEditMode = false;
    this.resetProfileForm();
    void this.loadProfile(true);
  }

  closeProfileModal(): void {
    this.profileModalOpen = false;
    this.profileEditMode = false;
  }

  startEditProfile(): void {
    this.profileEditMode = true;
  }

  cancelEditProfile(): void {
    this.profileEditMode = false;
  }

  saveProfile(): void {
    void this.persistProfile();
  }

  displayValue(value: string): string {
    return value?.trim() ? value : 'Not provided';
  }

  getDownloadUrl(url: string, filename: string): string {
    return buildDownloadUrl(url, filename);
  }

  private async loadProfile(force = false): Promise<void> {
    if (!this.isOwnerLoggedIn()) {
      this.profileLoaded = false;
      this.resetProfileForm();
      return;
    }
    if (this.profileLoaded && !force) {
      return;
    }
    try {
      const data = await this.ownerApi.getProfile();
      const fallbackName = this.auth.getUser()?.name || '';
      const fallbackEmail = this.auth.getUser()?.email || '';
      this.profileForm = {
        name: data?.name || fallbackName,
        phone: data?.phone || '',
        email: data?.email || fallbackEmail,
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

  private resetProfileForm(): void {
    const fallbackName = this.auth.getUser()?.name || '';
    const fallbackEmail = this.auth.getUser()?.email || '';
    this.profileForm = {
      name: fallbackName,
      phone: '',
      email: fallbackEmail,
      licenseNumber: '',
      licenseFrontImage: '',
      licenseBackImage: '',
      aadhaarNumber: '',
      address: '',
      gender: '',
      age: '',
    };
    this.licenseFrontFile = null;
    this.licenseBackFile = null;
  }

  private async persistProfile(): Promise<void> {
    if (this.profileSaving) {
      return;
    }
    const payload = this.normalizeProfilePayload();
    const validationError = this.validateProfile(payload);
    if (validationError) {
      this.flash.showError(validationError);
      return;
    }

    try {
      this.profileSaving = true;
      const formData = this.buildProfileFormData(payload);
      const response = await this.ownerApi.updateProfile(formData);
      const data = response.data || {};
      this.profileForm = {
        name: data.name || payload.name,
        phone: data.phone || payload.phone,
        email: data.email || payload.email,
        licenseNumber: data.licenseNumber || payload.licenseNumber,
        licenseFrontImage: data.licenseFrontImage || payload.licenseFrontImage,
        licenseBackImage: data.licenseBackImage || payload.licenseBackImage,
        aadhaarNumber: data.aadhaarNumber || payload.aadhaarNumber,
        address: data.address || payload.address,
        gender: data.gender || payload.gender,
        age: data.age ? String(data.age) : payload.age ? String(payload.age) : '',
      };
      this.licenseFrontFile = null;
      this.licenseBackFile = null;
      this.profileEditMode = false;
      this.profileLoaded = true;
      this.flash.showSuccess(response.message || 'Profile updated successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to save profile.'));
    } finally {
      this.profileSaving = false;
      this.refreshView();
    }
  }

  private normalizeProfilePayload(): {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
    licenseFrontImage: string;
    licenseBackImage: string;
    aadhaarNumber: string;
    address: string;
    gender: string;
    age: number | null;
  } {
    const ageValue = String(this.profileForm.age || '').trim();
    return {
      name: String(this.profileForm.name || '').trim(),
      phone: String(this.profileForm.phone || '').trim(),
      email: String(this.profileForm.email || '').trim().toLowerCase(),
      licenseNumber: String(this.profileForm.licenseNumber || '').trim().toUpperCase(),
      licenseFrontImage: String(this.profileForm.licenseFrontImage || '').trim(),
      licenseBackImage: String(this.profileForm.licenseBackImage || '').trim(),
      aadhaarNumber: String(this.profileForm.aadhaarNumber || '').trim(),
      address: String(this.profileForm.address || '').trim(),
      gender: String(this.profileForm.gender || '').trim(),
      age: ageValue ? Number(ageValue) : null,
    };
  }

  private validateProfile(payload: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
    licenseFrontImage: string;
    licenseBackImage: string;
    aadhaarNumber: string;
    address: string;
    gender: string;
    age: number | null;
  }): string | null {
    if (!payload.name) {
      return 'Name is required.';
    }
    if (!payload.email) {
      return 'Email is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return 'Please enter a valid email address.';
    }
    if (payload.phone && !/^[0-9]{10}$/.test(payload.phone)) {
      return 'Phone number must be 10 digits.';
    }
    if (payload.licenseNumber && !/^[A-Z]{2}[ -]?[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$/.test(payload.licenseNumber)) {
      return 'Invalid license number format.';
    }
    const hasFront = !!payload.licenseFrontImage || !!this.licenseFrontFile;
    const hasBack = !!payload.licenseBackImage || !!this.licenseBackFile;
    if (payload.licenseNumber && (!hasFront || !hasBack)) {
      return 'Please upload both front and back license images.';
    }
    if (payload.aadhaarNumber && !/^[2-9][0-9]{11}$/.test(payload.aadhaarNumber)) {
      return 'Aadhaar number must be 12 digits and start with 2-9.';
    }
    if (payload.gender && !['Male', 'Female'].includes(payload.gender)) {
      return 'Gender must be Male or Female.';
    }
    if (payload.age !== null && (payload.age < 19 || payload.age > 84)) {
      return 'Age must be between 19 and 84.';
    }
    return null;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }
  onLicenseImageSelect(event: Event, side: 'front' | 'back'): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type || !file.type.startsWith('image/')) {
      this.flash.showError('Please upload a valid license image (JPG/PNG).');
      if (input) {
        input.value = '';
      }
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.flash.showError('License image must be 2MB or smaller.');
      if (input) {
        input.value = '';
      }
      return;
    }
    if (side === 'front') {
      this.licenseFrontFile = file;
      this.profileForm.licenseFrontImage = URL.createObjectURL(file);
    } else {
      this.licenseBackFile = file;
      this.profileForm.licenseBackImage = URL.createObjectURL(file);
    }
    this.refreshView();
  }

  private refreshView(): void {
    try {
      this.cdr.markForCheck();
    } catch {}
    setTimeout(() => {
      try {
        this.cdr.detectChanges();
      } catch {}
    });
  }

  private buildProfileFormData(payload: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
    licenseFrontImage: string;
    licenseBackImage: string;
    aadhaarNumber: string;
    address: string;
    gender: string;
    age: number | null;
  }): FormData {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('phone', payload.phone);
    formData.append('email', payload.email);
    formData.append('licenseNumber', payload.licenseNumber);
    formData.append('aadhaarNumber', payload.aadhaarNumber);
    formData.append('address', payload.address);
    formData.append('gender', payload.gender);
    if (payload.age !== null && Number.isFinite(payload.age)) {
      formData.append('age', String(payload.age));
    }
    if (this.licenseFrontFile) {
      formData.append('licenseFrontImage', this.licenseFrontFile);
    }
    if (this.licenseBackFile) {
      formData.append('licenseBackImage', this.licenseBackFile);
    }
    return formData;
  }

}


