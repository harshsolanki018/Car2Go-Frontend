import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerAbout } from './owner-about';

describe('OwnerAbout', () => {
  let component: OwnerAbout;
  let fixture: ComponentFixture<OwnerAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerAbout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerAbout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
