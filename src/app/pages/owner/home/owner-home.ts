import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-owner-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owner-home.html',
  styleUrls: ['./owner-home.css'],
})
export class OwnerHome {
  constructor(public auth: AuthService) {}

  ownerStatusStats = [
    { value: '50K+', label: 'Monthly Partner Earnings' },
    { value: '500+', label: 'Active Partner Cars' },
    { value: '98%', label: 'On-Time Payouts' },
    { value: '24/7', label: 'Partner Support' },
  ];

  get isOwnerLoggedIn(): boolean {
    return this.auth.isLoggedIn() && this.auth.getRole() === 'Owner';
  }

  get ownerName(): string {
    return this.auth.getUser()?.name || 'Partner';
  }
}
