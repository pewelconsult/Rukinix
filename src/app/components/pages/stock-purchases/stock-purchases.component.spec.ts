import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPurchasesComponent } from './stock-purchases.component';

describe('StockPurchasesComponent', () => {
  let component: StockPurchasesComponent;
  let fixture: ComponentFixture<StockPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockPurchasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
