import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashMessageService } from '../../../core/services/flash-message';
import { AdminApiService } from '../../../core/services/admin-api';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.html',
})
export class Messages implements OnInit {
  messages: any[] = [];

  constructor(
    private flash: FlashMessageService,
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadMessages();
  }

  async loadMessages() {
    try {
      this.messages = await this.adminApi.listMessages('User');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load messages.'));
    } finally {
      this.refreshView();
    }
  }

  async updateStatus(message: any, status: string) {
    try {
      const response = await this.adminApi.updateMessageStatus(message.ticketId, status);
      message.status = response.data?.status || status;
      this.flash.showSuccess(response.message || 'Message status updated.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to update message status.'));
    } finally {
      this.refreshView();
    }
  }

  async deleteMessage(id: string) {
    const confirmDelete = confirm('Delete this message?');
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await this.adminApi.deleteMessage(id);
      this.messages = this.messages.filter((m) => m.ticketId !== id);
      this.flash.showSuccess(response.message || 'Message deleted successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to delete message.'));
    } finally {
      this.refreshView();
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }

  private refreshView(): void {
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
