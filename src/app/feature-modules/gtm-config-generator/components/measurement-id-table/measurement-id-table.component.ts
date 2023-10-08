import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-measurement-id-table',
  standalone: true,
  imports: [SharedModule],
  template: ` <ng-template
    cdkConnectedOverlay
    [cdkConnectedOverlayOpen]="isOpen"
    [cdkConnectedOverlayOrigin]="trigger"
  >
    <div class="measurement-id-table">
      <div class="measurement-id-table__header">
        <div class="measurement-id-table__title">
          <mat-icon class="measurement-id-table__close" (click)="closeOverlay()"
            >highlight_off</mat-icon
          >
          <div>Measurement ID setting</div>
        </div>
        <button
          mat-raised-button
          class="measurement-id-table__submit"
          color="primary"
          [disabled]="!form.valid"
          (click)="formData.emit(form); closeOverlay()"
        >
          Save
        </button>
      </div>
      <hr />
      <div [formGroup]="form" class="measurement-id-table__form">
        <div class="measurement-id-table__form__staging">
          <mat-form-field appearance="outline">
            <mat-label>Staging URL</mat-label>
            <input matInput formControlName="stagingUrl" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Staging Measurement ID</mat-label>
            <input matInput formControlName="stagingMeasurementId" />
          </mat-form-field>
        </div>
        <div class="measurement-id-table__form__production">
          <mat-form-field appearance="outline">
            <mat-label>Production URL</mat-label>
            <input matInput formControlName="productionUrl" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Production Measurement ID</mat-label>
            <input matInput formControlName="productionMeasurementId" />
          </mat-form-field>
        </div>
      </div>
    </div>
  </ng-template>`,
  styleUrls: ['./measurement-id-table.component.scss'],
})
export class MeasurementIdTableComponent {
  @Input() isOpen = false;
  @Input() trigger!: any;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() formData = new EventEmitter<any>();

  form: FormGroup = this.fb.group({
    stagingUrl: [''],
    stagingMeasurementId: [''],
    productionUrl: [''],
    productionMeasurementId: [''],
  });

  constructor(private fb: FormBuilder) {}

  closeOverlay() {
    this.closeEvent.emit();
  }
}
