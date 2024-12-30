import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-calculators',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './calculators.component.html',
  styleUrl: './calculators.component.css'
})
export class CalculatorsComponent {
  calculateTax(monthlyIncome: number): number {
    // Define tax brackets
    /*
    const taxBrackets: TaxBracket[] = [
      { rate: 0.00, base: 0, limit: 490, cumulative: 0 },
      { rate: 0.05, base: 490, limit: 600, cumulative: 0 },
      { rate: 0.10, base: 600, limit: 730, cumulative: 6 },
      { rate: 0.175, base: 730, limit: 3896.67, cumulative: 19 },
      { rate: 0.25, base: 3896.67, limit: 19896.67, cumulative: 573 },
      { rate: 0.30, base: 19896.67, limit: 50416.67, cumulative: 4573 },
      { rate: 0.35, base: 50416.67, limit: Infinity, cumulative: 13729 }
    ];
  */
    // If income is 0 or negative, return 0 tax
    if (monthlyIncome <= 0) {
      return 0;
    }
  
    let totalTax = 0;
  
    /*
    // Find applicable bracket
    for (let i = 0; i < taxBrackets.length; i++) {
      const bracket = taxBrackets[i];
      
      if (monthlyIncome > bracket.limit) {
        // If income exceeds this bracket, calculate tax for the full bracket
        const taxableAmount = bracket.limit - bracket.base;
        totalTax += taxableAmount * bracket.rate;
      } else {
        // If income falls within this bracket, calculate tax for partial amount
        const taxableAmount = monthlyIncome - bracket.base;
        totalTax += taxableAmount * bracket.rate;
        break;
      }
    }
      */
  
    // Round to 2 decimal places
    return Number(totalTax.toFixed(2));
  }
}
