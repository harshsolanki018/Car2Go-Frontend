import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerHome } from './owner-home';

describe('OwnerHome', () => {
  let component: OwnerHome;
  let fixture: ComponentFixture<OwnerHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerHome],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
