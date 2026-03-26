import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { FlashMessage } from './shared/components/flash-message/flash-message';
import { OwnerNavbar } from './shared/components/owner-navbar/owner-navbar';
import { OwnerFooter } from './shared/components/owner-footer/owner-footer';
import { AuthService } from './core/services/auth';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    OwnerNavbar,
    OwnerFooter,
    CommonModule,
    FlashMessage,
  ],
  templateUrl: './app.html',
})

export class AppComponent {
  isAdminRoute = false;
  isOwnerLayout = false;

  constructor(private router: Router, private auth: AuthService) {
    this.setLayoutFlags(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setLayoutFlags(event.urlAfterRedirects);
      }
    });
  }

  private setLayoutFlags(url: string): void {
    this.isAdminRoute = url.startsWith('/admin');
    const isOwnerRoute = url.startsWith('/owner');
    const isOwnerSession = this.auth.getRole() === 'Owner';
    this.isOwnerLayout = !this.isAdminRoute && (isOwnerRoute || isOwnerSession);
  }
}
