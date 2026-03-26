import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { FlashMessageService } from '../../core/services/flash-message';
import { CarsApiService } from '../../core/services/cars-api';
import { BookingsApiService } from '../../core/services/bookings-api';
import { PaymentOrderResponse, PaymentsApiService } from '../../core/services/payments-api';
import { SecureUrlPipe } from '../../shared/pipes/secure-url.pipe';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, SecureUrlPipe],
  templateUrl: './booking.html',
})
export class Booking implements OnInit {
  carId = '';
  car: any;
  bookedRanges: Array<{ start: string; end: string }> = [];

  today = new Date().toISOString().split('T')[0];
  maxDob = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  )
    .toISOString()
    .split('T')[0];

  fullName = '';
  phone = '';
  alternatePhone = '';
  email = '';
  dob = '';
  address = '';
  city = '';
  state = '';
  pincode = '';
  aadhaar = '';
  licenseNumber = '';
  licenseFront: File | null = null;
  licenseBack: File | null = null;
  emergencyName = '';
  emergencyPhone = '';
  agreeTerms = false;
  agreeLicense = false;
  userFieldsLocked = false;

  pickupDate = '';
  returnDate = '';
  totalDays = 0;
  totalPrice = 0;
  platformFee = 0;
  gstAmount = 0;
  totalPayable = 0;
  isProcessing = false;
  private failureReported = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private flash: FlashMessageService,
    private carsApi: CarsApiService,
    private bookingsApi: BookingsApiService,
    private paymentsApi: PaymentsApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carId = this.route.snapshot.paramMap.get('id') || '';
    void this.loadInitialData();
  }

  calculatePrice() {
    if (!this.pickupDate || !this.returnDate || !this.car) {
      this.totalDays = 0;
      this.totalPrice = 0;
      this.platformFee = 0;
      this.gstAmount = 0;
      this.totalPayable = 0;
      return;
    }

    const start = new Date(this.pickupDate);
    const end = new Date(this.returnDate);

    const diff = end.getTime() - start.getTime();
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (this.totalDays <= 0) {
      this.showError('Return date must be after pickup date.');
      this.totalPrice = 0;
      this.platformFee = 0;
      this.gstAmount = 0;
      this.totalPayable = 0;
      return;
    }

    if (this.hasDateConflict(start, end)) {
      this.showError('Selected dates are unavailable.');
      this.totalDays = 0;
      this.totalPrice = 0;
      this.platformFee = 0;
      this.gstAmount = 0;
      this.totalPayable = 0;
      return;
    }

    this.totalPrice = this.totalDays * this.car.pricePerDay;
    this.platformFee = this.totalPrice * 0.05;
    this.gstAmount = this.platformFee * 0.18;
    this.totalPayable = this.totalPrice + this.platformFee + this.gstAmount;
  }

  hasDateConflict(newStart: Date, newEnd: Date): boolean {
    return this.bookedRanges.some((range) => {
      const existingStart = new Date(range.start);
      const existingEnd = new Date(range.end);
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  }

  isAadhaarValid(): boolean {
    return /^[2-9][0-9]{11}$/.test(this.aadhaar);
  }

  isPhoneValid(value: string): boolean {
    return /^[0-9]{10}$/.test(value.trim());
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  isNameValid(value: string): boolean {
    return value.trim().length >= 2;
  }

  isPincodeValid(): boolean {
    return /^[1-9][0-9]{5}$/.test(this.pincode.trim());
  }

  isLicenseValid(): boolean {
    return /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$/.test(
      this.licenseNumber.trim().toUpperCase()
    );
  }

  isDobValid(): boolean {
    if (!this.dob) {
      return false;
    }
    const dobDate = new Date(this.dob);
    if (Number.isNaN(dobDate.getTime())) {
      return false;
    }
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();
    return (
      age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    );
  }

  isEmergencyValid(): boolean {
    if (!this.emergencyName.trim() || !this.emergencyPhone.trim()) {
      return false;
    }
    if (!this.isNameValid(this.emergencyName)) {
      return false;
    }
    if (!this.isPhoneValid(this.emergencyPhone)) {
      return false;
    }
    if (
      this.emergencyName.trim().toLowerCase() === this.fullName.trim().toLowerCase()
    ) {
      return false;
    }
    if (this.emergencyPhone.trim() === this.phone.trim()) {
      return false;
    }
    return true;
  }

  canShowPricing(): boolean {
    if (!this.car || this.totalDays <= 0 || this.totalPrice <= 0) {
      return false;
    }
    if (!this.isNameValid(this.fullName)) {
      return false;
    }
    if (!this.isPhoneValid(this.phone)) {
      return false;
    }
    if (!this.isEmailValid()) {
      return false;
    }
    if (!this.isDobValid()) {
      return false;
    }
    if (!this.address.trim() || !this.city.trim() || !this.state.trim()) {
      return false;
    }
    if (!this.isPincodeValid()) {
      return false;
    }
    if (!this.isAadhaarValid()) {
      return false;
    }
    if (!this.isLicenseValid()) {
      return false;
    }
    if (!this.licenseFront || !this.licenseBack) {
      return false;
    }
    if (!this.isEmergencyValid()) {
      return false;
    }
    if (!this.agreeTerms || !this.agreeLicense) {
      return false;
    }
    return true;
  }

  onLicenseFileSelect(event: Event, side: 'front' | 'back'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const allowed = file.type.startsWith('image/');
    if (!allowed) {
      this.showError('Please upload an image file (JPG/PNG/WEBP, max 2MB).');
      input.value = '';
      if (side === 'front') {
        this.licenseFront = null;
      } else {
        this.licenseBack = null;
      }
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showError('File must be 2MB or smaller.');
      input.value = '';
      if (side === 'front') {
        this.licenseFront = null;
      } else {
        this.licenseBack = null;
      }
      return;
    }
    if (side === 'front') {
      this.licenseFront = file;
    } else {
      this.licenseBack = file;
    }
  }

  async confirmBooking() {
    if (this.isProcessing) {
      return;
    }

    if (!this.car) {
      return;
    }

    if (!this.pickupDate || !this.returnDate) {
      this.showError('Please select pickup and return dates.');
      return;
    }

    if (!this.fullName.trim() || !this.phone.trim() || !this.email.trim()) {
      this.showError('Please enter full name, phone number, and email.');
      return;
    }

    if (!this.isPhoneValid(this.phone)) {
      this.showError('Phone number must be 10 digits.');
      return;
    }

    if (
      this.alternatePhone.trim() &&
      !this.isPhoneValid(this.alternatePhone)
    ) {
      this.showError('Alternate phone number must be 10 digits.');
      return;
    }

    if (!this.isEmailValid()) {
      this.showError('Please enter a valid email address.');
      return;
    }

    if (!this.isDobValid()) {
      this.showError('You must be at least 18 years old to book.');
      return;
    }

    if (!this.address.trim()) {
      this.showError('Please enter your home address.');
      return;
    }

    if (!this.city.trim() || !this.state.trim()) {
      this.showError('Please enter your city and state.');
      return;
    }

    if (!this.isPincodeValid()) {
      this.showError('Pincode must be 6 digits and cannot start with 0.');
      return;
    }

    if (!this.isAadhaarValid()) {
      this.showError('Aadhaar number must be 12 digits and start with 2-9.');
      return;
    }

    if (!this.isLicenseValid()) {
      this.showError('Please enter a valid driving license number.');
      return;
    }

    if (!this.licenseFront || !this.licenseBack) {
      this.showError('Please upload both driving license images (front & back).');
      return;
    }

    if (!this.emergencyName.trim() || !this.emergencyPhone.trim()) {
      this.showError('Please enter emergency contact name and phone.');
      return;
    }

    if (!this.isNameValid(this.emergencyName)) {
      this.showError('Emergency contact name must be at least 2 characters.');
      return;
    }

    if (!this.isPhoneValid(this.emergencyPhone)) {
      this.showError('Emergency contact phone must be 10 digits.');
      return;
    }

    if (
      this.emergencyName.trim().toLowerCase() === this.fullName.trim().toLowerCase()
    ) {
      this.showError('Emergency contact name must be different from your name.');
      return;
    }

    if (this.emergencyPhone.trim() === this.phone.trim()) {
      this.showError('Emergency contact phone must be different from your phone.');
      return;
    }

    if (!this.agreeTerms || !this.agreeLicense) {
      this.showError('Please accept the terms and confirm license validity.');
      return;
    }

    const start = new Date(this.pickupDate);
    const end = new Date(this.returnDate);
    const diff = end.getTime() - start.getTime();
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (this.totalDays <= 0) {
      this.showError('Return date must be after pickup date.');
      return;
    }

    if (this.hasDateConflict(start, end)) {
      this.showError('Selected dates are unavailable.');
      return;
    }

    const session = this.auth.getSession();
    if (!session) {
      this.showError('Please login to continue.');
      return;
    }

    try {
      this.isProcessing = true;
      const order = await this.paymentsApi.createOrder({
        carId: this.car.id,
        pickupDate: this.pickupDate,
        returnDate: this.returnDate,
      });
      this.applyServerPricing(order);
      await this.openRazorpayCheckout(order);
    } catch (error) {
      this.isProcessing = false;
      this.showError(this.getErrorMessage(error, 'Failed to start payment.'));
    }
  }

  getBookedRanges() {
    return this.bookedRanges;
  }

  private async loadInitialData(): Promise<void> {
    await this.prefillUserDetails();
    await Promise.all([this.loadCar(), this.loadBookedRanges()]);
    this.refreshView();
  }

  private async prefillUserDetails(): Promise<void> {
    await this.auth.ensureSessionLoaded();
    const user = this.auth.getUser();
    if (user) {
      this.fullName = user.name || this.fullName;
      this.email = user.email || this.email;
      this.phone = user.phone || this.phone;
      this.userFieldsLocked = true;
    }
  }

  private async loadCar(): Promise<void> {
    try {
      this.car = await this.carsApi.getCarById(this.carId);
    } catch {
      this.car = null;
    }
  }

  private async loadBookedRanges(): Promise<void> {
    try {
      this.bookedRanges = await this.bookingsApi.getBookedRangesForCar(this.carId);
    } catch {
      this.bookedRanges = [];
    }
  }

  private resetForm(): void {
    this.pickupDate = '';
    this.returnDate = '';
    this.totalDays = 0;
    this.totalPrice = 0;
    this.platformFee = 0;
    this.gstAmount = 0;
    this.totalPayable = 0;
    this.fullName = '';
    this.phone = '';
    this.alternatePhone = '';
    this.email = '';
    this.dob = '';
    this.address = '';
    this.city = '';
    this.state = '';
    this.pincode = '';
    this.aadhaar = '';
    this.licenseNumber = '';
    this.licenseFront = null;
    this.licenseBack = null;
    this.emergencyName = '';
    this.emergencyPhone = '';
    this.agreeTerms = false;
    this.agreeLicense = false;
  }

  private showError(message: string): void {
    this.flash.showError(message);
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

  private applyServerPricing(order: PaymentOrderResponse): void {
    this.totalDays = order.totalDays;
    this.totalPrice = order.baseAmount;
    this.platformFee = order.platformFee;
    this.gstAmount = order.gstAmount;
    this.totalPayable = order.totalAmount;
  }

  private async openRazorpayCheckout(order: PaymentOrderResponse): Promise<void> {
    await this.loadRazorpayScript();
    this.failureReported = false;

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Car2Go',
      description: `Booking for ${this.car?.name || 'car'}`,
      order_id: order.orderId,
      prefill: {
        name: this.fullName,
        email: this.email,
        contact: this.phone,
      },
      handler: (response: any) => {
        void this.handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: () => {
          void this.handlePaymentFailure('Payment cancelled by user.', order.orderId);
          this.isProcessing = false;
          this.refreshView();
        },
      },
      theme: {
        color: '#F97316',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      const reason =
        response?.error?.description ||
        response?.error?.reason ||
        response?.error?.code ||
        'Payment failed.';
      const orderId = response?.error?.metadata?.order_id || order.orderId;
      void this.handlePaymentFailure(reason, orderId);
    });
    razorpay.open();
  }

  private async handlePaymentSuccess(response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('razorpay_order_id', response.razorpay_order_id);
      formData.append('razorpay_payment_id', response.razorpay_payment_id);
      formData.append('razorpay_signature', response.razorpay_signature);
      formData.append('carId', this.car?.id || '');
      formData.append('pickupDate', this.pickupDate);
      formData.append('returnDate', this.returnDate);
      formData.append('fullName', this.fullName.trim());
      formData.append('phone', this.phone.trim());
      formData.append('alternatePhone', this.alternatePhone.trim());
      formData.append('email', this.email.trim());
      formData.append('dob', this.dob);
      formData.append('address', this.address.trim());
      formData.append('city', this.city.trim());
      formData.append('state', this.state.trim());
      formData.append('pincode', this.pincode.trim());
      formData.append('aadhaar', this.aadhaar.trim());
      formData.append('licenseNumber', this.licenseNumber.trim().toUpperCase());
      formData.append('emergencyName', this.emergencyName.trim());
      formData.append('emergencyPhone', this.emergencyPhone.trim());
      formData.append('agreeTerms', String(this.agreeTerms));
      formData.append('agreeLicense', String(this.agreeLicense));
      if (this.licenseFront) {
        formData.append('licenseFront', this.licenseFront);
      }
      if (this.licenseBack) {
        formData.append('licenseBack', this.licenseBack);
      }

      const verifyResponse = await this.paymentsApi.verifyPayment(formData);

      this.flash.showSuccess(verifyResponse.message || 'Booking confirmed.');
      this.resetForm();
      await this.loadBookedRanges();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      void this.router.navigate(['/cars']);
    } catch (error) {
      this.showError(this.getErrorMessage(error, 'Payment verification failed.'));
    } finally {
      this.isProcessing = false;
      this.refreshView();
    }
  }

  private async handlePaymentFailure(reason: string, orderId?: string): Promise<void> {
    if (this.failureReported) {
      return;
    }
    this.failureReported = true;
    try {
      await this.paymentsApi.reportPaymentFailure({
        razorpay_order_id: orderId,
        reason,
        fullName: this.fullName.trim(),
        email: this.email.trim(),
      });
      this.showError(reason || 'Payment failed.');
    } catch {
      this.showError(reason || 'Payment failed.');
    } finally {
      this.isProcessing = false;
      this.refreshView();
    }
  }

  private loadRazorpayScript(): Promise<void> {
    if ((window as any).Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
      document.body.appendChild(script);
    });
  }
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}
