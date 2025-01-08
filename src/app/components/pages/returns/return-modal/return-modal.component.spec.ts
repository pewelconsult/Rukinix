import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnModalComponent } from './return-modal.component';

describe('ReturnModalComponent', () => {
  let component: ReturnModalComponent;
  let fixture: ComponentFixture<ReturnModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
