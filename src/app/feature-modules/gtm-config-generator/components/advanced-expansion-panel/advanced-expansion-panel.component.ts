import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { EditorService } from '../../services/editor/editor.service';
import { tap, combineLatest, Subscription, take } from 'rxjs';
import { SharedModule } from '../../shared.module';

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
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder, private editorService: EditorService) {}

  ngAfterViewInit() {
    this.onFormChange();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onFormChange() {
    const formUpdateSubscription = combineLatest([
      this.editorService.editor$.inputJson,
      this.form.valueChanges,
    ])
      .pipe(
        tap(([editor, form]) => {
          this.handleEditorAndFormChanges(editor, form);
        })
      )
      .subscribe();
    this.subscriptions.push(formUpdateSubscription);
  }

  onPanelOpened() {
    const panelUpdateSubscription = this.editorService.editor$.inputJson
      .pipe(
        take(1),
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
    this.subscriptions.push(panelUpdateSubscription);
  }

  handleEditorAndFormChanges(editor: any, form: any) {
    if (!editor.state.doc.toString()) return;

    const jsonString = editor.state.doc.toString();
    const json = JSON.parse(jsonString);

    this.updateJsonForEvents(json, form.includeVideoTag, [
      'video_start',
      'video_progress',
      'video_completion',
    ]);

    this.updateJsonForEvents(json, form.includeScrollTag, ['scroll']);

    this.editorService.setContent('inputJson', JSON.stringify(json, null, 2));
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
