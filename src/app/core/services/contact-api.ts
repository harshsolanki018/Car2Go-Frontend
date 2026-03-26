import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client';

@Injectable({
  providedIn: 'root',
})
export class ContactApiService {
  constructor(private api: ApiClientService) {}

  async createMessage(payload: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    senderRole?: 'User' | 'Owner';
  }) {
    return this.api.post<any>('/messages', payload);
  }
}
