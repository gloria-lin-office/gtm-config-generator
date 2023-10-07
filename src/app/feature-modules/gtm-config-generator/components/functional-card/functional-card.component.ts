import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConverterService } from '../../services/converter/converter.service';
import { EditorService } from '../../services/editor/editor.service';
import { Subscription, combineLatest, tap } from 'rxjs';
import {
  FormControl,
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
import { GtmConfigGenerator } from 'src/app/interfaces/gtm-config-generator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { containerName, gtmId, tagManagerUrl } from './test-data';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConversionSuccessDialogComponent } from '../conversion-success-dialog/conversion-success-dialog.component';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';
import { AdvancedExpansionPanelComponent } from '../advanced-expansion-panel/advanced-expansion-panel.component';
import { EditorView } from 'codemirror';
import { extractAccountAndContainerId, preprocessInput } from './utilities';

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
    AdvancedExpansionPanelComponent,
  ],
  templateUrl: './functional-card.component.html',
  styleUrls: ['./functional-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FunctionalCardComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  // TODO: precise validation. For example, the tag manager url should be a valid url
  // gtmId should be a valid gtm id, such as GTM-XXXXXX
  form = this.fb.group({
    tagManagerUrl: [tagManagerUrl, Validators.required],
    containerName: [containerName, Validators.required],
    gtmId: [gtmId, Validators.required],
  });

  constructor(
    private converterService: ConverterService,
    public editorService: EditorService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {}

  convertCode() {
    const sub = combineLatest([this.editorService.editor$.inputJson])
      .pipe(
        tap(([jsonEditor]) => {
          try {
            this.performConversion(jsonEditor);
          } catch (error) {
            this.openDialog(error);
            console.error(error);
          }
        })
      )
      .subscribe();
    this.subscriptions.push(sub);
  }

  performConversion(jsonEditor: EditorView) {
    // 1) get the json from the editor
    const json = preprocessInput(jsonEditor.state.doc.toString());

    // 2) preprocess and set the json to the editor, fixing potential syntax errors
    this.editorService.setContent(
      'inputJson',
      JSON.stringify(JSON.parse(json), null, 2)
    );
    // 3) convert the json to gtm config
    const gtmConfigGenerator = this.generateGtmConfig(json);
    const result = this.converterService.convert(gtmConfigGenerator);
    this.postConversion(result);
  }

  postConversion(result: any) {
    this.editorService.setContent(
      'outputJson',
      JSON.stringify(result, null, 2)
    );
    this.openSuccessConversionDialog(result);

    window.dataLayer.push({
      event: 'btn_convert_click',
    });
  }

  generateGtmConfig(json: any): GtmConfigGenerator {
    const { accountId, containerId } = extractAccountAndContainerId(
      this.tagManagerUrl.value
    );

    // TODO: need to do a regex table to output the correct measurement id
    const gtmConfigGenerator: GtmConfigGenerator = {
      accountId: accountId,
      containerId: containerId,
      containerName: this.containerName.value,
      gtmId: this.gtmId.value,
      specs: json,
      stagingUrl: '',
      stagingMeasurementId: '',
      productionUrl: '',
      productionMeasurementId: '',
    };

    return gtmConfigGenerator;
  }

  onUpload() {
    this.openFileUploadDialog();
    window.dataLayer.push({
      event: 'btn_upload_click',
    });
  }

  openDialog(data: any) {
    // console.log('error message', data.message);
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

  get tagManagerUrl() {
    return this.form.get('tagManagerUrl') as FormControl<string>;
  }

  get containerName() {
    return this.form.get('containerName') as FormControl<string>;
  }

  get gtmId() {
    return this.form.get('gtmId') as FormControl<string>;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
