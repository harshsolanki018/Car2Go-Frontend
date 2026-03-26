import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client';

@Injectable({
  providedIn: 'root',
})
export class CarsApiService {
  constructor(private api: ApiClientService) {}

  async listCars() {
    const response = await this.api.get<any[]>('/cars');
    return response.data || [];
  }

  async getCarById(carId: string) {
    const response = await this.api.get<any>(`/cars/${carId}`);
    return response.data || null;
  }
}
