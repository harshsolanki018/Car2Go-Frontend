import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client';

@Injectable({
  providedIn: 'root',
})
export class OwnerApiService {
  constructor(private api: ApiClientService) {}

  async listCars() {
    const response = await this.api.get<any[]>('/owner/cars', true);
    return response.data || [];
  }

  async getCarById(carId: string) {
    const response = await this.api.get<any>(`/owner/cars/${carId}`, true);
    return response.data;
  }

  async createCar(payload: unknown) {
    const response = await this.api.post<any>('/owner/cars', payload, true);
    return response;
  }

  async updateCar(carId: string, payload: unknown) {
    const response = await this.api.put<any>(`/owner/cars/${carId}`, payload, true);
    return response;
  }

  async deleteCar(carId: string) {
    const response = await this.api.delete<null>(`/owner/cars/${carId}`, true);
    return response;
  }

  async getProfile() {
    const response = await this.api.get<any>('/owner/profile', true);
    return response.data;
  }

  async updateProfile(payload: unknown) {
    const response = await this.api.put<any>('/owner/profile', payload, true);
    return response;
  }

  async listBookings() {
    const response = await this.api.get<any[]>('/owner/bookings', true);
    return response.data || [];
  }

  async listPayouts() {
    const response = await this.api.get<any[]>('/owner/payouts', true);
    return response.data || [];
  }

  async approveBooking(bookingId: string) {
    const response = await this.api.patch<any>(
      `/owner/bookings/${bookingId}/approve`,
      {},
      true
    );
    return response;
  }

  async rejectBooking(bookingId: string) {
    const response = await this.api.patch<any>(
      `/owner/bookings/${bookingId}/reject`,
      {},
      true
    );
    return response;
  }

  async completeBooking(bookingId: string) {
    const response = await this.api.patch<any>(
      `/owner/bookings/${bookingId}/complete`,
      {},
      true
    );
    return response;
  }

  async verifyPickupCode(bookingId: string, pickupCode: string) {
    const response = await this.api.patch<any>(
      `/owner/bookings/${bookingId}/verify-pickup`,
      { pickupCode },
      true
    );
    return response;
  }
}


