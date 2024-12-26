import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryListTableComponent } from './inventory-list-table.component';

describe('InventoryListTableComponent', () => {
  let component: InventoryListTableComponent;
  let fixture: ComponentFixture<InventoryListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryListTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
