import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from './api-client';
import { API_BASE_URL } from './app-data-store';

@Injectable({
  providedIn: 'root',
})
export class BookingsApiService {
  constructor(
    private api: ApiClientService,
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  async getBookedRangesForCar(carId: string) {
    const response = await this.api.get<Array<{ start: string; end: string }>>(
      `/bookings/car/${carId}/ranges`,
      true
    );
    return response.data || [];
  }

  async createBooking(payload: {
    carId: string;
    pickupDate: string;
    returnDate: string;
    fullName: string;
    phone: string;
    alternatePhone: string;
    email: string;
    dob: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    aadhaar: string;
    licenseNumber: string;
    licenseFront: string;
    licenseBack: string;
    emergencyName: string;
    emergencyPhone: string;
    agreeTerms: boolean;
    agreeLicense: boolean;
  }) {
    return this.api.post<any>('/bookings', payload, true);
  }

  async getMyBookings() {
    const response = await this.api.get<any[]>('/bookings/me', true);
    return response.data || [];
  }

  async rateMyBooking(bookingId: number, rating: number, review = '') {
    return this.api.patch<any>(`/bookings/${bookingId}/rating`, { rating, review }, true);
  }

  async downloadInvoice(bookingId: number): Promise<Blob> {
    const url = `${this.apiBaseUrl}/bookings/${bookingId}/invoice`;
    return firstValueFrom(
      this.http.get(url, {
        responseType: 'blob',
        withCredentials: true,
      })
    );
  }
}
