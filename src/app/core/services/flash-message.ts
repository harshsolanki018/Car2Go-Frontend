import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FlashMessageType = 'success' | 'error';

export interface FlashMessage {
  type: FlashMessageType;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class FlashMessageService {
  private readonly messageSubject = new BehaviorSubject<FlashMessage | null>(null);
  readonly message$ = this.messageSubject.asObservable();

  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  showSuccess(text: string, durationMs = 2000): void {
    this.show('success', text, durationMs);
  }

  showError(text: string, durationMs = 2000): void {
    this.show('error', text, durationMs);
  }

  clear(): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }
    this.messageSubject.next(null);
  }

  private show(type: FlashMessageType, text: string, durationMs: number): void {
    this.messageSubject.next({ type, text });

    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }

    this.clearTimer = setTimeout(() => {
      this.messageSubject.next(null);
      this.clearTimer = null;
    }, durationMs);
  }
}
