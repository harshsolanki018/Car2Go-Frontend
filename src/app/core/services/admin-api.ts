import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client';

type DateRangeKey = '7d' | '30d' | '1y' | 'overall';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  constructor(private api: ApiClientService) {}

  async getDashboard() {
    const response = await this.api.get<{
      stats: any[];
      carStats: any[];
      overallRating: number;
      companyEarnings?: number;
      companyEarningsDisplay?: string;
    }>('/admin/dashboard', true);
    return response.data;
  }

  async getStats(range: DateRangeKey) {
    const response = await this.api.get<any>(`/admin/stats?range=${range}`, true);
    return response.data;
  }

  async listUsers() {
    const response = await this.api.get<any[]>('/admin/users', true);
    return response.data || [];
  }

  async toggleUserBlock(userId: string) {
    const response = await this.api.patch<any>(
      `/admin/users/${encodeURIComponent(userId)}/toggle-block`,
      {},
      true
    );
    return response;
  }

  async deleteUser(userId: string) {
    const response = await this.api.delete<null>(`/admin/users/${encodeURIComponent(userId)}`, true);
    return response;
  }

  async listBookings() {
    const response = await this.api.get<any[]>('/admin/bookings', true);
    return response.data || [];
  }

  async markOwnerPayoutsPaid(ownerId: string) {
    const response = await this.api.patch<any>(
      `/admin/owners/${encodeURIComponent(ownerId)}/payouts/mark-paid`,
      {},
      true
    );
    return response;
  }

  async approveBooking(bookingId: number) {
    const response = await this.api.patch<any>(`/admin/bookings/${bookingId}/approve`, {}, true);
    return response;
  }

  async rejectBooking(bookingId: number) {
    const response = await this.api.patch<any>(`/admin/bookings/${bookingId}/reject`, {}, true);
    return response;
  }

  async completeBooking(bookingId: number) {
    const response = await this.api.patch<any>(`/admin/bookings/${bookingId}/complete`, {}, true);
    return response;
  }

  async listMessages(role?: 'User' | 'Owner') {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    const response = await this.api.get<any[]>(`/admin/messages${query}`, true);
    return response.data || [];
  }

  async updateMessageStatus(ticketId: string, status: string) {
    const response = await this.api.patch<any>(
      `/admin/messages/${encodeURIComponent(ticketId)}/status`,
      { status },
      true
    );
    return response;
  }

  async deleteMessage(ticketId: string) {
    const response = await this.api.delete<null>(`/admin/messages/${encodeURIComponent(ticketId)}`, true);
    return response;
  }

  async getHomeCars() {
    const response = await this.api.get<{
      cars: any[];
      featuredIds: string[];
      updatedAt: string | null;
    }>('/admin/home-cars', true);
    return response.data;
  }

  async saveHomeCars(carIds: string[]) {
    const response = await this.api.put<any>('/admin/home-cars', { carIds }, true);
    return response;
  }

  async clearHomeCars() {
    const response = await this.api.delete<null>('/admin/home-cars', true);
    return response;
  }

  async listCars() {
    const response = await this.api.get<any[]>('/admin/cars', true);
    return response.data || [];
  }

  async approveCar(carId: string) {
    const response = await this.api.patch<any>(`/admin/cars/${carId}/approve`, {}, true);
    return response;
  }

  async rejectCar(carId: string) {
    const response = await this.api.patch<any>(`/admin/cars/${carId}/reject`, {}, true);
    return response;
  }

  async blockCar(carId: string) {
    const response = await this.api.patch<any>(`/admin/cars/${carId}/block`, {}, true);
    return response;
  }

  async unblockCar(carId: string) {
    const response = await this.api.patch<any>(`/admin/cars/${carId}/unblock`, {}, true);
    return response;
  }
  async deleteCar(carId: string) {
    const response = await this.api.delete<null>(`/admin/cars/${carId}`, true);
    return response;
  }
}





