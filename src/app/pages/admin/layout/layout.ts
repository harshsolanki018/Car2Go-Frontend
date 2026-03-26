import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth';
@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, FontAwesomeModule],
  standalone: true,
  templateUrl: './layout.html',
})
export class AdminLayout {
  faUserTie = faUserTie;
  showLogoutModal = false;
  constructor(private auth: AuthService) {}

logout() {
  if (!this.auth.isLoggedIn()) {
    void this.auth.logout('/login');
    return;
  }

  this.showLogoutModal = true;
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
}

}
