import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OwnerContact } from './owner-contact';

describe('OwnerContact', () => {
  let component: OwnerContact;
  let fixture: ComponentFixture<OwnerContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerContact],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
