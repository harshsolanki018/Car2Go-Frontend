import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
import { ownerGuard } from './core/guards/owner-guard';
import { userPortalGuard } from './core/guards/user-portal-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'owner-login',
    loadComponent: () =>
      import('./pages/auth/owner-login/owner-login').then((m) => m.OwnerLogin),
  },
  {
    path: 'owner-register',
    loadComponent: () =>
      import('./pages/auth/owner-register/owner-register')
        .then((m) => m.OwnerRegister),
  },
  {
    path: 'forgot-password',
    data: { role: 'User', loginRoute: '/login' },
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password')
        .then((m) => m.ForgotPassword),
  },
  {
    path: 'owner-forgot-password',
    data: { role: 'Owner', loginRoute: '/owner-login' },
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password')
        .then((m) => m.ForgotPassword),
  },
  {
    path: 'owner',
    loadComponent: () =>
      import('./pages/owner/layout/layout').then((m) => m.OwnerLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/owner/home/owner-home').then((m) => m.OwnerHome),
      },
      {
        path: 'dashboard',
        canActivate: [ownerGuard],
        loadComponent: () =>
          import('./pages/owner/dashboard/owner-dashboard')
            .then((m) => m.OwnerDashboard),
      },
      {
        path: 'estimate-profit',
        loadComponent: () =>
          import('./pages/owner/estimate-profit/estimate-profit')
            .then((m) => m.OwnerEstimateProfit),
      },
      {
        path: 'owner-cars',
        canActivate: [ownerGuard],
        loadComponent: () =>
          import('./pages/owner/owner-cars/owner-cars').then((m) => m.OwnerCars),
      },
      {
        path: 'my-bookings',
        canActivate: [ownerGuard],
        loadComponent: () =>
          import('./pages/owner/my-bookings/my-bookings')
            .then((m) => m.OwnerBookings),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/owner/about/owner-about').then((m) => m.OwnerAbout),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/owner/contact/owner-contact').then((m) => m.OwnerContact),
      },
    ],
  },
  {
    path: '',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'cars',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/cars/cars').then((m) => m.Cars),
  },
  {
    path: 'cars/:id',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/cars/car-details/car-details')
        .then((m) => m.CarDetails),
  },
  {
    path: 'booking/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/booking/booking').then((m) => m.Booking),
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/booking/booking-history/booking-history')
        .then((m) => m.BookingHistory),
  },
  {
    path: 'about',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    canActivate: [userPortalGuard],
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/layout/layout')
        .then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./pages/admin/bookings/bookings').then((m) => m.Bookings),
      },
      {
        path: 'cars',
        loadComponent: () =>
          import('./pages/admin/cars/cars').then((m) => m.Cars),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users/users').then((m) => m.Users),
      },
      {
        path: 'owners',
        loadComponent: () =>
          import('./pages/admin/owners/owners').then((m) => m.Owners),
      },
      {
        path: 'owner-performance',
        loadComponent: () =>
          import('./pages/admin/owner-performance/owner-performance')
            .then((m) => m.OwnerPerformance),
      },
      {
        path: 'owner-car-requests',
        loadComponent: () =>
          import('./pages/admin/owner-car-requests/owner-car-requests')
            .then((m) => m.OwnerCarRequests),
      },
      {
        path: 'owner-messages',
        loadComponent: () =>
          import('./pages/admin/owner-messages/owner-messages')
            .then((m) => m.OwnerMessages),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/admin/messages/messages').then((m) => m.Messages),
      },
      {
        path: 'home-cars',
        loadComponent: () =>
          import('./pages/admin/home-cars/home-cars').then((m) => m.HomeCars),
      },
      {
        path: 'stats',
        loadComponent: () =>
          import('./pages/admin/stats/stats').then((m) => m.Stats),
      },
      {
        path: 'user-activity',
        loadComponent: () =>
          import('./pages/admin/user-activity/user-activity')
            .then((m) => m.UserActivity),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
