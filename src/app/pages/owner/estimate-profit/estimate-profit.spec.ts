import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerEstimateProfit } from './estimate-profit';

describe('OwnerEstimateProfit', () => {
  let component: OwnerEstimateProfit;
  let fixture: ComponentFixture<OwnerEstimateProfit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerEstimateProfit],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerEstimateProfit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
