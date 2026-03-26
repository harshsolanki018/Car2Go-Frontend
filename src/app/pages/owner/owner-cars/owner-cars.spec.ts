import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OwnerCars } from './owner-cars';

describe('OwnerCars', () => {
  let component: OwnerCars;
  let fixture: ComponentFixture<OwnerCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerCars],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerCars);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
