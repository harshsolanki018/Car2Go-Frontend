import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OwnerBookings } from './my-bookings';

describe('OwnerBookings', () => {
  let component: OwnerBookings;
  let fixture: ComponentFixture<OwnerBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerBookings],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerBookings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
