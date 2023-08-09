import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { NgIf } from '@angular/common';
import { EditorService } from '../../services/editor/editor.service';
import { BehaviorSubject, tap } from 'rxjs';

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
  ],
  template: `<div class="file-upload-dialog">
    <mat-dialog-content class="file-upload-dialog__actions">
      <div class="file-upload-dialog__actions__action">
        <button type="button" mat-button (click)="fileInput.click()">
          <mat-icon>cloud_upload</mat-icon>
          Upload JSON File
        </button>
        <input
          hidden
          (change)="onFileSelected($event)"
          #fileInput
          type="file"
        />
      </div>
    </mat-dialog-content>
  </div>`,
  styles: [
    `
      .file-upload-dialog {
        &__actions {
          .mat-icon {
            transform: scale(1.5);
          }
          width: 100%;
          margin: auto;

          &__action {
            button {
              margin-right: 1rem;
            }
          }

          &__action:not(:last-child) {
            margin-bottom: 1rem;
          }
        }
      }
    `,
  ],
})
export class FileUploadDialogComponent {
  constructor(public dialog: MatDialog, private editorService: EditorService) {}

  selectedFile: File | null = null;
  fileContent = new BehaviorSubject<any>(null);

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      const fileExtension = file.name.split('.').pop();
      const fileType = file.type;

      if (fileExtension === 'json' && fileType === 'application/json') {
        this.selectedFile = file;
        this.readFileContent(file);
        this.handleFileContent();
      } else {
        this.selectedFile = null;
        this.dialog.open(ErrorDialogComponent, {
          data: {
            message: 'Please upload a valid JSON file.',
          },
        });
      }
    }
  }

  readFileContent(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const fileContentString = e.target.result;

      try {
        // update the file content
        this.fileContent.next(JSON.parse(fileContentString));
      } catch (error) {
        this.dialog.open(ErrorDialogComponent, {
          data: {
            message: 'Error parsing JSON file. Please try again.',
          },
        });
      }
    };

    reader.onerror = () => {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          message: 'Error reading file. Please try again.',
        },
      });
    };

    reader.readAsText(file);
  }

  handleFileContent() {
    // handle the file content after it has been read
    this.fileContent
      .pipe(
        tap((data) => {
          if (data !== null || data !== undefined) {
            this.editorService.setContent(
              'inputJson',
              JSON.stringify(data, null, 2)
            );
            this.dialog.closeAll();
          }
        })
      )
      .subscribe();
  }
}
