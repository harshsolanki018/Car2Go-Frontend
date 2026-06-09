# Car2Go Frontend

Frontend application for Car2Go – a modern car rental platform that enables users to browse vehicles, make bookings, manage rentals, and track booking history through an intuitive and responsive interface.

---

## Overview

Car2Go Frontend is built using Angular and Tailwind CSS, providing a fast, responsive, and user-friendly experience. The application allows customers to search vehicles, view detailed information, upload required documents, complete bookings, and track rental status in real time.

---
## Live Links
- API Base: https://api.car2go.free.je
- Frontend: https://app.car2go.free.je
## Features

### Authentication

- User Registration
- User Login
- JWT-Based Authentication
- Protected Routes

### Vehicle Browsing

- Browse Available Cars
- Search & Filter Vehicles
- View Vehicle Details
- View Pricing Information
- Check Availability

### Booking Management

- Create Bookings
- Upload Verification Documents
- View Booking History
- Track Booking Status
- Download Booking Invoice

### Payments

- Razorpay Payment Integration
- Secure Checkout Process
- Payment Verification

### Notifications

- Email Booking Confirmations
- Booking Status Updates
- Rental Notifications

### User Experience

- Responsive Design
- Mobile Friendly Interface
- Fast Navigation
- Modern UI using Tailwind CSS

---

## Tech Stack

| Technology | Purpose |
|------------|----------|
| Angular | Frontend Framework |
| TypeScript | Application Development |
| Tailwind CSS | Styling |
| RxJS | Reactive Programming |
| Angular Router | Navigation |
| HTTP Client | API Communication |

---

## Project Structure

```text
src/
│
├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── guards/
│   ├── models/
│   └── shared/
│
├── assets/
├── environments/
└── styles/
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/harshsolanki018/car2go-frontend.git
cd car2go-frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Update:

```text
src/environments/environment.ts
```

Add your backend API URL.

### Run Development Server

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

## Screenshots

Add screenshots for:

- Home Page
- Car Listing Page
- Car Details Page
- Booking Page
- User Dashboard
- Payment Page

---

## Future Enhancements

- Mobile Application
- Real-Time Notifications
- Vehicle Reviews & Ratings
- AI-Based Recommendations
- Multi-Language Support

---

## Author

**Harsh Solanki**

---

## License

This project is developed for educational and portfolio purposes.
