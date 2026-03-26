import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarsApiService } from '../../../core/services/cars-api';
import { SecureUrlPipe } from '../../../shared/pipes/secure-url.pipe';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SecureUrlPipe],
  templateUrl: './car-details.html',
})
export class CarDetails implements OnInit {
  car: any;
  carId = '';

  constructor(
    private route: ActivatedRoute,
    private carsApi: CarsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carId = this.route.snapshot.paramMap.get('id') || '';
    void this.loadCar();
  }

  private async loadCar(): Promise<void> {
    try {
      this.car = await this.carsApi.getCarById(this.carId);
    } catch {
      this.car = null;
    } finally {
      this.refreshView();
    }
  }

  private refreshView(): void {
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
