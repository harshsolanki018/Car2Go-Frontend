import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AdminApiService } from '../../../core/services/admin-api';
import { FlashMessageService } from '../../../core/services/flash-message';

@Component({
  selector: 'app-owners',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './owners.html',
  styleUrls: ['./owners.css'],
})
export class Owners implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  owners: any[] = [];
  searchText = '';

  constructor(
    private adminApi: AdminApiService,
    private flash: FlashMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadOwners();
  }

  async loadOwners(): Promise<void> {
    try {
      const users = await this.adminApi.listUsers();
      this.owners = users.filter((user) => (user.role || '').toLowerCase() === 'owner');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to load owners.'));
    } finally {
      this.refreshView();
    }
  }

  get filteredOwners(): any[] {
    const search = this.searchText.toLowerCase();
    return this.owners.filter((owner) => {
      const name = String(owner.name || '').toLowerCase();
      const email = String(owner.email || '').toLowerCase();
      const id = String(owner.id || '').toLowerCase();
      return name.includes(search) || email.includes(search) || id.includes(search);
    });
  }

  async toggleBlock(owner: any) {
    try {
      const response = await this.adminApi.toggleUserBlock(owner.id);
      owner.blocked = !!response.data?.blocked;
      this.flash.showSuccess(
        response.message ||
          (owner.blocked ? 'Owner blocked successfully.' : 'Owner unblocked successfully.')
      );
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to update owner status.'));
    } finally {
      this.refreshView();
    }
  }

  async deleteOwner(ownerEmail: string) {
    const owner = this.owners.find((item) => item.email === ownerEmail);
    if (!owner?.id) {
      this.flash.showError('Owner not found.');
      return;
    }

    try {
      const response = await this.adminApi.deleteUser(owner.id);
      this.owners = this.owners.filter((item) => item.email !== ownerEmail);
      this.flash.showSuccess(response.message || 'Owner deleted successfully.');
    } catch (error) {
      this.flash.showError(this.getErrorMessage(error, 'Failed to delete owner.'));
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
