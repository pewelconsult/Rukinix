import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesListTableComponent } from './sales-list-table.component';

describe('SalesListTableComponent', () => {
  let component: SalesListTableComponent;
  let fixture: ComponentFixture<SalesListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesListTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
