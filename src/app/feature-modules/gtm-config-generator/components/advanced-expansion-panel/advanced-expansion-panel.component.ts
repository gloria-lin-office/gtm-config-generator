import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { tap, combineLatest, take, Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../shared.module';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { EditorFacadeService } from '../../services/editor-facade/editor-faced.service';
import { SetupConstructorService } from '../../services/setup-constructor/setup-constructor.service';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-advanced-expansion-panel',
  standalone: true,
  imports: [SharedModule, ErrorDialogComponent],
  templateUrl: './advanced-expansion-panel.component.html',
  styleUrls: ['./advanced-expansion-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancedExpansionPanelComponent implements AfterViewInit {
  form: FormGroup = this.fb.group({
    includeVideoTag: [false],
    includeScrollTag: [false],
    includeItemScopedVariables: [false],
  });

  setupForm: FormGroup = this.fb.group({
    configurationName: ['GA4 Configuration'],
  });

  @ViewChild(MatAccordion) accordion!: MatAccordion;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private editorFacadeService: EditorFacadeService,
    private setupConstructorService: SetupConstructorService
  ) {}

  ngAfterViewInit() {
    this.onFormChange();
    this.onSetupFormChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormChange() {
    combineLatest([
      this.editorFacadeService.getInputJsonContent(),
      this.form.valueChanges,
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([editor, form]) => {
          this.handleEditorAndFormChanges(editor, form);
        })
      )
      .subscribe();
  }

  onPanelOpened() {
    this.editorFacadeService
      .getInputJsonContent()
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        tap((editor) => {
          const jsonString = editor?.state?.doc?.toString();

          if (jsonString) {
            const json = JSON.parse(jsonString);
            const hasVideoTag = json.some(
              (item: any) =>
                item.event === 'video_start' ||
                item.event === 'video_progress' ||
                item.event === 'video_complete'
            );
            const hasScrollTag = json.some(
              (item: any) => item.event === 'scroll'
            );

            this.form.patchValue(
              {
                includeVideoTag: hasVideoTag,
                includeScrollTag: hasScrollTag,
              },
              { emitEvent: false }
            );
          }
        })
      )
      .subscribe();
  }

  handleEditorAndFormChanges(editor: any, form: any) {
    if (!editor.state.doc.toString()) return;
    if (this.form.value.includeItemScopedVariables) {
      this.setupConstructorService.setIncludeItemScopedVariables(true);
    }

    try {
      const jsonString = editor.state.doc.toString();
      const json = JSON.parse(jsonString);

      this.updateJsonForEvents(json, form.includeVideoTag, [
        'video_start',
        'video_progress',
        'video_completion',
      ]);

      this.updateJsonForEvents(json, form.includeScrollTag, ['scroll']);
      this.editorFacadeService.setInputJsonContent(json);
    } catch (error) {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          title: 'Error',
          content: 'Please check your JSON syntax.',
        },
      });
    }
  }

  private updateJsonForEvents(
    json: any[],
    shouldInclude: boolean,
    eventNames: string[]
  ): void {
    eventNames.forEach((eventName) => {
      const eventIndex = json.findIndex(
        (item: any) => item.event === eventName
      );

      if (shouldInclude && eventIndex === -1) {
        json.push({ event: eventName });
      } else if (!shouldInclude && eventIndex !== -1) {
        json.splice(eventIndex, 1);
      }
    });
  }

  onSetupFormChange() {
    this.setupForm.valueChanges
      .pipe(
        tap((configurationName: string) => {
          if (configurationName) {
            this.setupConstructorService.setConfigurationName(
              configurationName
            );
          }
        })
      )
      .subscribe();
  }
}
