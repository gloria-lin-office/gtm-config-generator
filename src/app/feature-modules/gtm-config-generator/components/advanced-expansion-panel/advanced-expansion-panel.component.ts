import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { tap, combineLatest, take, Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../shared.module';
import { Dialog } from '@angular/cdk/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { EditorFacadeService } from '../../services/editor-facade/editor-faced.service';

@Component({
  selector: 'app-advanced-expansion-panel',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="advanced">
      <mat-accordion multi>
        <mat-expansion-panel (opened)="onPanelOpened()" togglePosition="before">
          <mat-expansion-panel-header [@.disabled]="true">
            <mat-panel-title> Advanced Settings </mat-panel-title>
          </mat-expansion-panel-header>
          <section class="advanced__tags">
            <form [formGroup]="form">
              <mat-checkbox formControlName="includeVideoTag"
                >Include Video Tag</mat-checkbox
              >
              <mat-checkbox formControlName="includeScrollTag"
                >Include Scroll Tag</mat-checkbox
              >
            </form>
          </section>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [
    `
      .advanced {
        caret-color: transparent; // hide contenteditable caret
        &__tags {
          display: flex;
          flex-direction: column;
        }

        .mdc-form-field > label {
          font-size: 1.3rem;
        }

        .mat-expansion-panel-header {
          height: 48px !important;
        }

        .mat-expansion-panel {
          .mat-expansion-indicator {
            transition: transform 0.3s ease;

            &::after {
              transform: rotate(-45deg);
            }
          }

          &.mat-expanded {
            .mat-expansion-indicator {
              transform: rotate(90deg) !important;
            }
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancedExpansionPanelComponent implements AfterViewInit {
  form: FormGroup = this.fb.group({
    includeVideoTag: [false],
    includeScrollTag: [false],
  });
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: Dialog,
    private editorFacadeService: EditorFacadeService
  ) {}

  ngAfterViewInit() {
    this.onFormChange();
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
}
