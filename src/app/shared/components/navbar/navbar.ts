import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  mobileMenuOpen = false;
  profileMenuOpen = false;
  showLogoutModal = false;

  constructor(public auth: AuthService) {}

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobile() {
    this.mobileMenuOpen = false;
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  getUserInitial(): string {
    const name = this.auth.getUser()?.name || '';
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  confirmLogout() {
    if (!this.auth.isLoggedIn()) {
      void this.auth.logout('/');
      return;
    }

    this.showLogoutModal = true;
    this.profileMenuOpen = false;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  async proceedLogout() {
    const didLogout = await this.auth.logoutIfAuthenticated('/');
    if (!didLogout) {
      this.showLogoutModal = false;
      return;
    }

    this.showLogoutModal = false;
    this.profileMenuOpen = false;
    this.mobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile-container')) {
      this.profileMenuOpen = false;
    }
  }
}
