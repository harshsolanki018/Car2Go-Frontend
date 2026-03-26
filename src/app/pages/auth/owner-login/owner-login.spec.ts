import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerLogin } from './owner-login';

describe('OwnerLogin', () => {
  let component: OwnerLogin;
  let fixture: ComponentFixture<OwnerLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerLogin],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
