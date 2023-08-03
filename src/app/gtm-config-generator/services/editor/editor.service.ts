import { ElementRef, Injectable } from '@angular/core';
import { EditorView } from 'codemirror';
import { placeholder } from '@codemirror/view';
import { BehaviorSubject, map } from 'rxjs';
import { jsonLightEditorExtensions } from './editor-extensions';
import { jsonString } from '../converter/test-gtm-data';
import { editorStyles } from './editor-style';

export type EditorExtension = 'inputJson' | 'outputJson';
type ExtensionArray = any[];

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  editorExtensions: Record<EditorExtension, ExtensionArray> = {
    inputJson: jsonLightEditorExtensions,
    outputJson: jsonLightEditorExtensions,
  };

  contentSubjects = {
    inputJson: new BehaviorSubject(`Placeholder content for JSON editor`),
    outputJson: new BehaviorSubject(`The output content will be here`),
  };

  editorSubjects = {
    inputJson: new BehaviorSubject<EditorView>(new EditorView()),
    outputJson: new BehaviorSubject<EditorView>(new EditorView()),
  };

  editor$ = {
    inputJson: this.editorSubjects.inputJson.asObservable(),
    outputJson: this.editorSubjects.outputJson.asObservable(),
  };

  constructor() {}

  initEditorView(
    extension: EditorExtension,
    elementRef: ElementRef,
    content?: string
  ) {
    let editorView = null;
    if (extension === 'inputJson' || extension === 'outputJson') {
      editorView = new EditorView({
        extensions: [
          ...this.editorExtensions[extension],
          EditorView.theme(editorStyles),
          EditorView.lineWrapping,
          placeholder(
            content ? content : this.contentSubjects[extension].getValue()
          ),
        ],
        parent: elementRef.nativeElement,
      });
    } else {
      editorView = new EditorView({
        extensions: this.editorExtensions[extension],
        parent: elementRef.nativeElement,
      });
    }

    if (extension === 'inputJson') {
      editorView.dispatch({
        changes: {
          from: 0,
          insert: jsonString,
          to: editorView.state.doc.length,
        },
      });
    }

    this.editorSubjects[extension].next(editorView);
  }

  setContent(extension: EditorExtension, content: string) {
    // set content in contentSubjects
    this.contentSubjects[extension].next(content);
    // dispatch content to editorView
    this.editorSubjects[extension].getValue().dispatch({
      changes: {
        from: 0,
        insert: content,
        to: this.editorSubjects[extension].getValue().state.doc.length,
      },
    });
  }
}
