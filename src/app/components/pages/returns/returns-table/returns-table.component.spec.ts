import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnsTableComponent } from './returns-table.component';

describe('ReturnsTableComponent', () => {
  let component: ReturnsTableComponent;
  let fixture: ComponentFixture<ReturnsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
