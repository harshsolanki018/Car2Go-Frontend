import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerRegister } from './owner-register';

describe('OwnerRegister', () => {
  let component: OwnerRegister;
  let fixture: ComponentFixture<OwnerRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerRegister],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
