import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementIdTableComponent } from './measurement-id-table.component';

describe('MeasurementIdTableComponent', () => {
  let component: MeasurementIdTableComponent;
  let fixture: ComponentFixture<MeasurementIdTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeasurementIdTableComponent]
    });
    fixture = TestBed.createComponent(MeasurementIdTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
