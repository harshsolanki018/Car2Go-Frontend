import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client';

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  totalDays: number;
  baseAmount: number;
  platformFee: number;
  gstAmount: number;
  totalAmount: number;
  holdSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsApiService {
  constructor(private api: ApiClientService) {}

  async createOrder(payload: {
    carId: string;
    pickupDate: string;
    returnDate: string;
  }) {
    const response = await this.api.post<PaymentOrderResponse>(
      '/payments/create-order',
      payload,
      true
    );
    return response.data;
  }

  async verifyPayment(payload: FormData | {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
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
    licenseFront?: string;
    licenseBack?: string;
    emergencyName: string;
    emergencyPhone: string;
    agreeTerms: boolean;
    agreeLicense: boolean;
  }) {
    const response = await this.api.post<any>('/payments/verify', payload, true);
    return response;
  }

  async reportPaymentFailure(payload: {
    razorpay_order_id?: string;
    reason?: string;
    fullName?: string;
    email?: string;
  }) {
    const response = await this.api.post<any>('/payments/failed', payload, true);
    return response;
  }
}
