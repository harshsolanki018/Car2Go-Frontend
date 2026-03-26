import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerFooter } from './owner-footer';

describe('OwnerFooter', () => {
  let component: OwnerFooter;
  let fixture: ComponentFixture<OwnerFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerFooter],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
