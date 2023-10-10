import {
  Component,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ConverterService } from '../../services/converter/converter.service';
import { Subject, combineLatest, take, takeUntil, tap } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { GtmConfigGenerator } from 'src/app/interfaces/gtm-config-generator';
import { containerName, gtmId, tagManagerUrl } from './test-data';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConversionSuccessDialogComponent } from '../conversion-success-dialog/conversion-success-dialog.component';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';
import { AdvancedExpansionPanelComponent } from '../advanced-expansion-panel/advanced-expansion-panel.component';
import { extractAccountAndContainerId, preprocessInput } from './utilities';
import { SharedModule } from '../../shared.module';
import { EditorFacadeService } from '../../services/editor-facade/editor-faced.service';
import { SetupConstructorService } from '../../services/setup-constructor/setup-constructor.service';

@Component({
  selector: 'app-functional-card',
  standalone: true,
  imports: [SharedModule, AdvancedExpansionPanelComponent],
  templateUrl: './functional-card.component.html',
  styleUrls: ['./functional-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FunctionalCardComponent implements OnDestroy {
  @ViewChild('accordionContainer')
  accordionContainer!: AdvancedExpansionPanelComponent;
  private destroy$ = new Subject<void>();
  form = this.fb.group({
    tagManagerUrl: [tagManagerUrl, Validators.required],
    containerName: [containerName, Validators.required],
    gtmId: [gtmId, Validators.required],
  });

  constructor(
    private converterService: ConverterService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public editorFacadeService: EditorFacadeService,
    private setupConstructorService: SetupConstructorService
  ) {}

  convertCode() {
    this.accordionContainer.accordion.closeAll();
    combineLatest([
      this.editorFacadeService.getInputJsonContent(),
      this.setupConstructorService.getConfigurationName(),
      this.setupConstructorService.getIncludeItemScopedVariables(),
    ])
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        tap(
          ([
            inputJsonEditor,
            configurationName,
            includeItemScopedVariables,
          ]) => {
            try {
              const json = preprocessInput(
                inputJsonEditor.state.doc.toString()
              );
              this.performConversion(
                json,
                configurationName,
                includeItemScopedVariables
              );
            } catch (error) {
              this.openDialog(error);
              console.error(error);
            }
          }
        )
      )
      .subscribe();
  }

  performConversion(
    json: any,
    configurationName: string,
    includeItemScopedVariables: boolean
  ) {
    this.editorFacadeService.setInputJsonContent(JSON.parse(json));
    const gtmConfigGenerator = this.generateGtmConfig(json);
    const result = this.converterService.convert(
      configurationName,
      gtmConfigGenerator,
      includeItemScopedVariables
    );
    this.postConversion(result);
  }

  postConversion(result: any) {
    this.editorFacadeService.setOutputJsonContent(result);
    this.openSuccessConversionDialog(result);

    window.dataLayer.push({
      event: 'btn_convert_click',
    });
  }

  generateGtmConfig(json: any): GtmConfigGenerator {
    const { accountId, containerId } = extractAccountAndContainerId(
      this.tagManagerUrl.value
    );

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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
