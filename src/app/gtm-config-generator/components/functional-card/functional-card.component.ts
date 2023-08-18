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
import { containerName, gtmId, tagManagerUrl } from './test-data';
import { fixJsonString } from '../../services/converter/utilities/utilities';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConversionSuccessDialogComponent } from '../conversion-success-dialog/conversion-success-dialog.component';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';

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
    MatDialogModule,
  ],
  templateUrl: './functional-card.component.html',
  styleUrls: ['./functional-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FunctionalCardComponent {
  // TODO: precise validation. For example, the tag manager url should be a valid url
  // gtmId should be a valid gtm id, such as GTM-XXXXXX
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
    public editorService: EditorService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {}

  convertCode() {
    combineLatest([this.editorService.editor$.inputJson])
      .pipe(
        tap(([jsonEditor]) => {
          try {
            const json = this.preprocessInput(jsonEditor.state.doc.toString());
            const measurementTableData = this.measurementIdForm.value;
            const { accountId, containerId } =
              this.extractAccountAndContainerId(
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
            this.openSuccessConversionDialog(result);

            window.dataLayer.push({
              event: 'btn_convert_click',
            });
          } catch (error) {
            this.openDialog(error);
            console.error(error);
          }
        })
      )
      .subscribe();
  }

  onUpload() {
    this.openFileUploadDialog();
    window.dataLayer.push({
      event: 'btn_upload_click',
    });
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
      (stagingUrl && stagingMeasurementId) ||
      (productionUrl && productionMeasurementId)
    ) {
      console.log('staging url and measurement id are filled');
      this.isSettingMeasurementId = true;
    }

    console.log(this.measurementIdForm.value);
  }

  preprocessInput(inputString: string) {
    try {
      // Attempt to parse the input JSON string
      JSON.parse(inputString);
      return inputString;
    } catch (error) {
      // If parsing fails, attempt to fix common issues and try again
      let fixedString = '';
      fixedString = fixJsonString(inputString);

      // Attempt to parse the fixed string
      try {
        JSON.parse(fixedString);
        // If parsing succeeds, update the input JSON editor with the fixed string
        this.editorService.setContent(
          'inputJson',
          JSON.stringify(JSON.parse(fixedString), null, 2)
        );
        return fixedString;
      } catch (error) {
        this.openDialog(error);
        console.error(error);
        return 'null';
      }
    }
  }

  openDialog(data: any) {
    console.log('error message', data.message);
    this.dialog.open(ErrorDialogComponent, {
      data: {
        message: data.message,
      },
    });
  }

  openSuccessConversionDialog(configuration: any) {
    this.dialog.open(ConversionSuccessDialogComponent, {
      data: configuration,
    });
  }

  openFileUploadDialog() {
    this.dialog.open(FileUploadDialogComponent);
  }
}
