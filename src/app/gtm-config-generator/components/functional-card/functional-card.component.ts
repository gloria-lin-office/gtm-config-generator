import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConverterService } from '../../services/converter/converter.service';
import { EditorService } from '../../services/editor/editor.service';
import { combineLatest, tap } from 'rxjs';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MeasurementIdTableComponent } from '../measurement-id-table/measurement-id-table.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormBuilder } from '@angular/forms';
import { GtmConfigGenerator } from 'src/app/interfaces/gtm-cofig-generator';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-functional-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    OverlayModule,
    MeasurementIdTableComponent,
    MatCheckboxModule,
  ],
  templateUrl: './functional-card.component.html',
  styleUrls: ['./functional-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FunctionalCardComponent {
  form = this.fb.group({
    tagManagerUrl: ['', Validators.required],
    containerName: ['', Validators.required],
    gtmId: ['', Validators.required],
  });

  // the dummy form for measurement id setting
  measurementIdForm = this.fb.group({
    stagingUrl: [''],
    stagingMeasurementId: [''],
    productionUrl: [''],
    productionMeasurementId: [''],
  });

  isOpen = false;
  isSettingMeasurementId = false;

  constructor(
    private converterService: ConverterService,
    private editorService: EditorService,
    private fb: FormBuilder
  ) {}

  convertCode() {
    combineLatest([this.editorService.editor$.inputJson])
      .pipe(
        tap(([jsonEditor]) => {
          const json = jsonEditor.state.doc.toString();
          const measurementTableData = this.measurementIdForm.value;
          const { accountId, containerId } = this.extractAccountAndContainerId(
            this.form.get('tagManagerUrl')?.value as string
          );

          const gtmConfigGenerator: GtmConfigGenerator = {
            accountId: accountId,
            containerId: containerId,
            containerName: this.form.get('containerName')?.value as string,
            gtmId: this.form.get('gtmId')?.value as string,
            specs: json,
            stagingUrl: measurementTableData.stagingUrl as string,
            stagingMeasurementId:
              measurementTableData.stagingMeasurementId as string,
            productionUrl: measurementTableData.productionUrl as string,
            productionMeasurementId:
              measurementTableData.productionMeasurementId as string,
          };

          const result = this.converterService.convert(gtmConfigGenerator);
          console.log(result);
          this.editorService.setContent(
            'outputJson',
            JSON.stringify(result, null, 2)
          );
        })
      )
      .subscribe();
  }

  download() {
    combineLatest([this.editorService.editor$.outputJson])
      .pipe(
        tap(([jsonEditor]) => {
          const json = jsonEditor.state.doc.toString();
          // Create a Blob from the JSON string
          let blob = new Blob([json], { type: 'application/json' }),
            url = URL.createObjectURL(blob);

          // Create a link and programmatically click it
          let a = document.createElement('a');
          a.href = url;
          a.download = 'file.json'; // or any other name you want
          a.click(); // this will start download

          // Clean up after the download to avoid memory leaks
          URL.revokeObjectURL(url);
        })
      )
      .subscribe();
  }

  setMeasurementId() {
    this.isOpen = true;
  }

  closeLoginInterface() {
    this.isOpen = false;
  }

  extractAccountAndContainerId(url: string) {
    const regex = /accounts\/(\d+)\/containers\/(\d+)/;
    const result = regex.exec(url);
    if (result) {
      console.log(result);
      return {
        accountId: result[1],
        containerId: result[2],
      };
    }
    return {
      accountId: '',
      containerId: '',
    };
  }

  handleMeasurementIdSettingFormData(data: FormGroup) {
    console.log(data);
    const stagingUrl = data.get('stagingUrl')?.value;
    const stagingMeasurementId = data.get('stagingMeasurementId')?.value;
    const productionUrl = data.get('productionUrl')?.value;
    const productionMeasurementId = data.get('productionMeasurementId')?.value;
    this.measurementIdForm.patchValue({
      stagingUrl: stagingUrl,
      stagingMeasurementId: stagingMeasurementId,
      productionUrl: productionUrl,
      productionMeasurementId: productionMeasurementId,
    });

    if (
      stagingUrl &&
      stagingMeasurementId &&
      productionUrl &&
      productionMeasurementId
    ) {
      console.log('staging url and measurement id are filled');
      this.isSettingMeasurementId = true;
    }

    console.log(this.measurementIdForm.value);
  }
}
