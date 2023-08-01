import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConverterService } from '../../services/converter/converter.service';
import { EditorService } from '../../services/editor/editor.service';
import { combineLatest, tap } from 'rxjs';
import { EditorView } from 'codemirror';

@Component({
  selector: 'app-functional-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './functional-card.component.html',
  styleUrls: ['./functional-card.component.scss'],
})
export class FunctionalCardComponent {
  constructor(
    private converterService: ConverterService,
    private editorService: EditorService
  ) {}

  convertCode() {
    combineLatest([this.editorService.editor$.inputJson])
      .pipe(
        tap(([jsonEditor]) => {
          const json = jsonEditor.state.doc.toString();
          const result = this.converterService.convert(json);
          console.log(result);
        })
      )
      .subscribe();
  }
}
