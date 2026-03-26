import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlashMessageService } from '../../../core/services/flash-message';

@Component({
  selector: 'app-flash-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="flash.message$ | async as message"
      class="fixed z-[1000] pointer-events-none bottom-4 left-1/2 -translate-x-1/2 sm:top-4 sm:right-4 sm:bottom-auto sm:left-auto sm:translate-x-0"
    >
      <div
        class="px-4 py-3 rounded-md border shadow-lg text-sm font-medium max-w-[92vw] sm:max-w-sm text-center sm:text-left"
        [ngClass]="
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        "
      >
        {{ message.text }}
      </div>
    </div>
  `,
})
export class FlashMessage {
  constructor(public flash: FlashMessageService) {}
}
