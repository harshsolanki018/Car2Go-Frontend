import { Injectable, InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const STORAGE_KEYS = {
  session: 'session',
  authToken: 'authToken',
  userEmail: 'userEmail',
  role: 'role',
  users: 'users',
  cars: 'cars',
  adminBookings: 'adminBookings',
  contactMessages: 'contactMessages',
  homeFeaturedCarsConfig: 'homeFeaturedCarsConfig',
} as const;

export type DataStoreMode = 'local' | 'api';

export const DATA_STORE_MODE = new InjectionToken<DataStoreMode>('DATA_STORE_MODE', {
  providedIn: 'root',
  factory: () => 'api',
});

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

@Injectable({
  providedIn: 'root',
})
export class AppDataStore {
  readonly keys = STORAGE_KEYS;
  private sessionValue: unknown | null = null;

  getSession<T>(): T | null {
    if (this.sessionValue) {
      return this.sessionValue as T;
    }

    const stored = this.readJson<T | null>(this.getSessionStorage(), this.keys.session, null);
    if (stored) {
      this.sessionValue = stored;
    }
    return stored;
  }

  setSession(value: unknown): void {
    this.sessionValue = value;
    this.writeJson(this.getSessionStorage(), this.keys.session, value);
  }

  clearSession(): void {
    this.sessionValue = null;
    this.removeItem(this.getSessionStorage(), this.keys.session);
  }

  getAuthToken(): string | null {
    return null;
  }

  setAuthToken(_token: string): void {
    // Auth token is cookie-based (HttpOnly) and not stored in browser storage.
  }

  clearAuthToken(): void {
    this.removeItem(this.getLocalStorage(), this.keys.authToken);
  }

  setLegacySession(userEmail: string, role: string): void {
    this.writeJson(this.getLocalStorage(), this.keys.userEmail, userEmail);
    this.writeJson(this.getLocalStorage(), this.keys.role, role);
  }

  clearLegacySession(): void {
    this.removeItem(this.getLocalStorage(), this.keys.userEmail);
    this.removeItem(this.getLocalStorage(), this.keys.role);
  }

  getUsers<T>(): T[] {
    return this.readJson<T[]>(this.getLocalStorage(), this.keys.users, []);
  }

  setUsers(users: unknown[]): void {
    this.writeJson(this.getLocalStorage(), this.keys.users, users);
  }

  getCars<T>(): T[] {
    return this.readJson<T[]>(this.getLocalStorage(), this.keys.cars, []);
  }

  setCars(cars: unknown[]): void {
    this.writeJson(this.getLocalStorage(), this.keys.cars, cars);
  }

  getBookings<T>(): T[] {
    return this.readJson<T[]>(this.getLocalStorage(), this.keys.adminBookings, []);
  }

  setBookings(bookings: unknown[]): void {
    this.writeJson(this.getLocalStorage(), this.keys.adminBookings, bookings);
  }

  getContactMessages<T>(): T[] {
    return this.readJson<T[]>(this.getLocalStorage(), this.keys.contactMessages, []);
  }

  setContactMessages(messages: unknown[]): void {
    this.writeJson(this.getLocalStorage(), this.keys.contactMessages, messages);
  }

  getHomeFeaturedConfigRaw<T>(): T | null {
    return this.readJson<T | null>(this.getLocalStorage(), this.keys.homeFeaturedCarsConfig, null);
  }

  setHomeFeaturedConfig(value: unknown): void {
    this.writeJson(this.getLocalStorage(), this.keys.homeFeaturedCarsConfig, value);
  }

  clearHomeFeaturedConfig(): void {
    this.removeItem(this.getLocalStorage(), this.keys.homeFeaturedCarsConfig);
  }

  private getLocalStorage(): Storage | null {
    try {
      const storage = (globalThis as { localStorage?: Storage }).localStorage;
      return storage && typeof storage.getItem === 'function' ? storage : null;
    } catch {
      return null;
    }
  }

  private getSessionStorage(): Storage | null {
    try {
      const storage = (globalThis as { sessionStorage?: Storage }).sessionStorage;
      return storage && typeof storage.getItem === 'function' ? storage : null;
    } catch {
      return null;
    }
  }

  private readJson<T>(storage: Storage | null, key: string, fallback: T): T {
    if (!storage) {
      return fallback;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson(storage: Storage | null, key: string, value: unknown): void {
    if (!storage) {
      return;
    }
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  private removeItem(storage: Storage | null, key: string): void {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(key);
    } catch {}
  }
}
