import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-owner-about',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './owner-about.html',
  styleUrls: ['./owner-about.css'],
})
export class OwnerAbout {
  constructor(private auth: AuthService) {}

  get ctaButtonText(): string {
    return this.auth.isLoggedIn() && this.auth.getRole() === 'Owner'
      ? 'Open Partner Home'
      : 'Join Car2Go Partners';
  }

  get ctaButtonLink(): string {
    return this.auth.isLoggedIn() && this.auth.getRole() === 'Owner'
      ? '/owner'
      : '/owner-register';
  }
}
