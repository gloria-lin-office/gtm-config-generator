import { Injectable } from '@angular/core';
import { EditorService } from '../editor/editor.service';

@Injectable({
  providedIn: 'root',
})
export class EditorFacadeService {
  constructor(private editorService: EditorService) {}

  setInputJsonContent(json: any): void {
    this.editorService.setContent('inputJson', JSON.stringify(json, null, 2));
  }

  setOutputJsonContent(json: any): void {
    this.editorService.setContent('outputJson', JSON.stringify(json, null, 2));
  }

  getEditorView() {
    return this.editorService.editor$;
  }

  getInputJsonContent() {
    return this.editorService.editor$.inputJson;
  }
}
