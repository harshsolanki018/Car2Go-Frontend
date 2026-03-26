import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCar, faScrewdriver} from '@fortawesome/free-solid-svg-icons';
import {faSackDollar} from '@fortawesome/free-solid-svg-icons';
import {faStopwatch} from '@fortawesome/free-solid-svg-icons'; 
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth';
@Component({
  selector: 'app-about',
  imports: [RouterModule, CommonModule, FontAwesomeModule],
  standalone: true,
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class About {
  faCar = faCar;
  faSackDollar = faSackDollar;
  faStopwatch = faStopwatch;
  faScrewdriver = faScrewdriver;  
  faPhone = faPhone;

  constructor(private auth: AuthService) {}

  get ctaButtonText(): string {
    return this.auth.isLoggedIn() ? 'Explore Cars' : 'Login to Explore Cars';
  }

  get ctaButtonLink(): string {
    return this.auth.isLoggedIn() ? '/cars' : '/login';
  }
}
