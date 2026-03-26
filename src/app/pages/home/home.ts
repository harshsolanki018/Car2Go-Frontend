import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCar, faSackDollar, faScrewdriver, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth';
import { ApiClientService } from '../../core/services/api-client';
import { SecureUrlPipe } from '../../shared/pipes/secure-url.pipe';

interface HomeCar {
  id: string;
  name: string;
  image?: string;
  location?: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  status?: string;
}

interface HomeStatusStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, FontAwesomeModule, SecureUrlPipe],
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  faCar = faCar;
  faSackDollar = faSackDollar;
  faStopwatch = faStopwatch;
  faScrewdriver = faScrewdriver;

  homeCars: HomeCar[] = [];
  statusBarStats: HomeStatusStat[] = [
    { label: 'Cars Available', value: '120' },
    { label: 'Happy Customers', value: '2000' },
    { label: 'Cities Covered', value: '28' },
    { label: 'Completed Rides', value: '1,250' },
  ];

  constructor(
    public auth: AuthService,
    private api: ApiClientService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.refreshHomeData();
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    void this.refreshHomeData();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get userName(): string {
    return this.auth.getUser()?.name || 'there';
  }

  get heroDescription(): string {
    if (this.isLoggedIn) {
      return `Welcome back, ${this.userName}. Pick your next ride and continue your journey with Car2Go.`;
    }

    return 'Quick, easy, and affordable car rentals. Car2Go helps you get on the road effortlessly.';
  }

  get heroButtonText(): string {
    return this.isLoggedIn ? 'Explore Cars' : 'Get Started';
  }

  get heroButtonLink(): string {
    return this.isLoggedIn ? '/cars' : '/register';
  }

  get browseCarsLink(): string {
    return this.isLoggedIn ? '/cars' : '/login';
  }

  get primaryBottomCtaText(): string {
    return this.isLoggedIn ? 'Explore Cars' : 'Login to Book';
  }

  get primaryBottomCtaLink(): string {
    return this.isLoggedIn ? '/cars' : '/login';
  }

  get secondaryBottomCtaText(): string {
    return this.isLoggedIn ? 'My Bookings' : 'Create Account';
  }

  get secondaryBottomCtaLink(): string {
    return this.isLoggedIn ? '/my-bookings' : '/register';
  }

  get rentNowText(): string {
    return this.isLoggedIn ? 'Rent Now' : 'Login to Book';
  }

  carCardLink(carId: string): string {
    return this.isLoggedIn ? `/cars/${carId}` : '/login';
  }

  trackByStatLabel(_: number, stat: HomeStatusStat): string {
    return stat.label;
  }

  private async refreshHomeData(): Promise<void> {
    await Promise.all([
      this.loadHomeCars(),
    ]);
    this.refreshView();
  }

  private async loadHomeCars(): Promise<void> {
    try {
      const response = await this.api.get<HomeCar[]>('/home/featured-cars');
      if (Array.isArray(response.data)) {
        this.homeCars = response.data.slice(0, 3);
      } else {
        this.homeCars = [];
      }
    } catch {
      this.homeCars = [];
    }
  }

  private refreshView(): void {
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
