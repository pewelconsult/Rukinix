import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoremanagerComponent } from './storemanager.component';

describe('StoremanagerComponent', () => {
  let component: StoremanagerComponent;
  let fixture: ComponentFixture<StoremanagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoremanagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoremanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
