import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerNavbar } from './owner-navbar';

describe('OwnerNavbar', () => {
  let component: OwnerNavbar;
  let fixture: ComponentFixture<OwnerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerNavbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
