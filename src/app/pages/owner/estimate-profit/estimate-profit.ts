import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ProfitBreakdown {
  monthlyRevenue: number;
  platformCommission: number;
  gstOnCommission: number;
  totalExpenses: number;
  netMonthlyProfit: number;
  annualProfit: number;
}

@Component({
  selector: 'app-owner-estimate-profit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estimate-profit.html',
  styleUrls: ['./estimate-profit.css'],
})
export class OwnerEstimateProfit {
  pricePerDay: number | null = null;
  rentalDaysPerMonth: number | null = null;
  maintenanceCost: number | null = null;
  insuranceCost: number | null = null;
  showAnnual = false;

  get breakdown(): ProfitBreakdown {
    const monthlyRevenue = this.calculateRevenue(
      this.pricePerDay,
      this.rentalDaysPerMonth
    );
    const platformCommission = monthlyRevenue * 0.15;
    const gstOnCommission = platformCommission * 0.18;
    const totalExpenses =
      this.getExpenseValue(this.maintenanceCost) +
      this.getExpenseValue(this.insuranceCost);
    const netMonthlyProfit =
      monthlyRevenue - platformCommission - gstOnCommission - totalExpenses;
    const annualProfit = netMonthlyProfit * 12;

    return {
      monthlyRevenue,
      platformCommission,
      gstOnCommission,
      totalExpenses,
      netMonthlyProfit,
      annualProfit,
    };
  }

  private calculateRevenue(
    pricePerDay: number | null,
    rentalDays: number | null
  ): number {
    const price = Number(pricePerDay);
    const days = Number(rentalDays);
    if (!Number.isFinite(price) || !Number.isFinite(days) || price <= 0 || days <= 0) {
      return 0;
    }
    return price * days;
  }

  private getExpenseValue(value: number | null): number {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      return 0;
    }
    return amount;
  }
}
