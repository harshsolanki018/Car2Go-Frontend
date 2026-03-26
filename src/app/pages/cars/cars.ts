import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CarsApiService } from '../../core/services/cars-api';
import { SecureUrlPipe } from '../../shared/pipes/secure-url.pipe';

interface Car {
  id: string;
  name: string;
  fuelType: string;
  transmission: string;
  pricePerDay: number;
  location: string;
  state?: string;
  city?: string;
  area?: string;
  image?: string;
  status?: string;
  ratingAvg?: number;
  ratingCount?: number;
}

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, FontAwesomeModule, SecureUrlPipe],
  templateUrl: './cars.html',
  styleUrls: ['./cars.css'],
})
export class Cars implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;

  searchText = '';
  selectedFuel = 'all';
  selectedTransmission = 'all';
  selectedState = 'all';
  selectedCity = 'all';
  selectedArea = 'all';
  maxPrice = 10000;

  enableFilters = false;
  cars: Car[] = [];

  constructor(
    private carsApi: CarsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.loadCars();
  }

  async loadCars(): Promise<void> {
    try {
      this.cars = await this.carsApi.listCars();
    } catch {
      this.cars = [];
    } finally {
      this.refreshView();
    }
  }

  getCarRating(carId: string): { avg: number; count: number } {
    const car = this.cars.find((item) => item.id === carId);
    return {
      avg: Number(car?.ratingAvg || 0),
      count: Number(car?.ratingCount || 0),
    };
  }

  get filteredCars(): Car[] {
    if (!this.enableFilters) {
      return this.cars;
    }

    return this.cars.filter((car) => {
      const { state, city, area } = this.getCarLocationParts(car);
      const matchesSearch = car.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

      const matchesFuel =
        this.selectedFuel === 'all' || car.fuelType === this.selectedFuel;

      const matchesTransmission =
        this.selectedTransmission === 'all' ||
        car.transmission === this.selectedTransmission;

      const matchesState =
        this.selectedState === 'all' ||
        (state && state === this.selectedState);

      const matchesCity =
        this.selectedCity === 'all' ||
        (city && city === this.selectedCity);

      const matchesArea =
        this.selectedArea === 'all' ||
        (area && area === this.selectedArea);

      const matchesPrice = car.pricePerDay <= this.maxPrice;

      return (
        matchesSearch &&
        matchesFuel &&
        matchesTransmission &&
        matchesState &&
        matchesCity &&
        matchesArea &&
        matchesPrice
      );
    });
  }

  get stateOptions(): string[] {
    return this.getUniqueValues(this.cars, (car) => this.getCarLocationParts(car).state);
  }

  get cityOptions(): string[] {
    return this.getUniqueValues(this.cars, (car) => {
      const parts = this.getCarLocationParts(car);
      if (this.selectedState !== 'all' && parts.state !== this.selectedState) {
        return '';
      }
      return parts.city || '';
    });
  }

  get areaOptions(): string[] {
    return this.getUniqueValues(this.cars, (car) => {
      const parts = this.getCarLocationParts(car);
      if (this.selectedState !== 'all' && parts.state !== this.selectedState) {
        return '';
      }
      if (this.selectedCity !== 'all' && parts.city !== this.selectedCity) {
        return '';
      }
      return parts.area || '';
    });
  }

  onStateChange(): void {
    this.selectedCity = 'all';
    this.selectedArea = 'all';
  }

  onCityChange(): void {
    this.selectedArea = 'all';
  }

  private getUniqueValues(
    cars: Car[],
    selector: (car: Car) => string | undefined
  ): string[] {
    const values = new Set<string>();
    cars.forEach((car) => {
      const value = String(selector(car) || '').trim();
      if (value) {
        values.add(value);
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  private getCarLocationParts(car: Car): { state: string; city: string; area: string } {
    const state = String(car.state || '').trim();
    const city = String(car.city || '').trim();
    const area = String(car.area || '').trim();

    if (state || city || area) {
      return { state, city, area };
    }

    const location = String(car.location || '').trim();
    if (!location) {
      return { state: '', city: '', area: '' };
    }

    const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
    return {
      city: parts[0] || '',
      area: parts[1] || '',
      state: parts[2] || '',
    };
  }

  private refreshView(): void {
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
