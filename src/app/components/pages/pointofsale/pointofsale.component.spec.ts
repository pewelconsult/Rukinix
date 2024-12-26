import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointofsaleComponent } from './pointofsale.component';

describe('PointofsaleComponent', () => {
  let component: PointofsaleComponent;
  let fixture: ComponentFixture<PointofsaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointofsaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointofsaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
