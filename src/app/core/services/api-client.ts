import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './app-data-store';

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  async get<T>(path: string, authenticated = false): Promise<ApiEnvelope<T>> {
    return this.request<T>('GET', path, undefined, authenticated);
  }

  async post<T>(path: string, body: unknown, authenticated = false): Promise<ApiEnvelope<T>> {
    return this.request<T>('POST', path, body, authenticated);
  }

  async put<T>(path: string, body: unknown, authenticated = false): Promise<ApiEnvelope<T>> {
    return this.request<T>('PUT', path, body, authenticated);
  }

  async patch<T>(path: string, body: unknown, authenticated = false): Promise<ApiEnvelope<T>> {
    return this.request<T>('PATCH', path, body, authenticated);
  }

  async delete<T>(path: string, authenticated = false): Promise<ApiEnvelope<T>> {
    return this.request<T>('DELETE', path, undefined, authenticated);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    authenticated = false
  ): Promise<ApiEnvelope<T>> {
    const url = `${this.apiBaseUrl}${path}`;
    const headers = this.buildHeaders(authenticated, body);

    try {
      const response = await firstValueFrom(
        this.http.request<ApiEnvelope<T>>(method, url, {
          body,
          headers,
          withCredentials: true,
        })
      );

      if (response && typeof response === 'object' && 'success' in response) {
        return response;
      }

      return {
        success: true,
        data: (response as unknown) as T,
      };
    } catch (error) {
      throw this.toError(error);
    }
  }

  private buildHeaders(_authenticated: boolean, body?: unknown): HttpHeaders {
    let headers = new HttpHeaders();

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  private toError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const message =
        typeof error.error?.message === 'string'
          ? error.error.message
          : error.status
            ? `Request failed (${error.status}).`
            : 'Network error. Please check your connection.';
      return new Error(message);
    }

    return new Error('Request failed.');
  }
}
