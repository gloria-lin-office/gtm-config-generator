import { unfixedableJsonString } from './../../components/xlsx-sidenav-form/xlsx-helper';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { WebWorkerService } from 'src/app/services/web-worker/web-worker.service';
import {
  convertSpecStringToObject,
  filterGtmSpecsFromData,
  filterNonEmptyData,
} from '../../components/xlsx-sidenav-form/xlsx-helper';
import { DataRow } from 'src/app/interfaces/gtm-cofig-generator';
import { MatDialog } from '@angular/material/dialog';
import { EditorService } from '../editor/editor.service';
import { ErrorDialogComponent } from '../../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class XlsxProcessingService {
  workbook$ = new BehaviorSubject<any>(null);
  worksheetNames$ = new BehaviorSubject<string[]>(['']);
  fileName$ = new BehaviorSubject<string>('');
  dataSource$ = new BehaviorSubject<any[]>([]);
  displayedDataSource$ = new BehaviorSubject<any[]>([]);
  displayedColumns$ = new BehaviorSubject<string[]>([]);
  isRenderingJson$ = new BehaviorSubject<boolean>(false);
  isPreviewing$ = new BehaviorSubject<boolean>(true);

  constructor(
    private webWorkerService: WebWorkerService,
    private dialog: MatDialog,
    private editorService: EditorService
  ) {}

  loadXlsxFile(file: File) {
    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.webWorkerService.postMessage('message', {
        action: 'readXlsx',
        data: e.target.result,
      });

      this.fileName$.next(fileName);
      this.processXlsxData();
    };

    reader.onerror = (error) => {
      console.error(error);
    };

    reader.readAsArrayBuffer(file);
  }

  processXlsxData() {
    // Logic from processXlsxData
    this.webWorkerService
      .onMessage()
      .pipe(
        tap((data) => {
          if (data.action === 'readXlsx') {
            this.handleReadXlsxAction(data);
          } else if (data.action === 'switchSheet') {
            this.handleSwitchSheetAction(data);
          } else if (data.action === 'previewData') {
            this.handlePreviewDataAction(data);
          } else if (data.action === 'extractSpecs') {
            this.handleExtractSpecsAction(data);
          }
        })
      )
      .subscribe();
  }

  handleReadXlsxAction(data: any): void {
    this.workbook$.next(data.workbook);
    this.worksheetNames$.next(data.sheetNames);
    this.dataSource$.next(data.jsonData);
    this.displayedDataSource$.next(filterNonEmptyData(data.jsonData));
    this.displayedColumns$.next(
      Object.keys(filterNonEmptyData(data.jsonData)[0])
    );
  }

  handleSwitchSheetAction(data: any) {
    this.dataSource$.next(data.jsonData);
    this.displayedDataSource$.next(filterNonEmptyData(data.jsonData));
    this.displayedColumns$.next(
      Object.keys(filterNonEmptyData(data.jsonData)[0])
    );
  }

  handlePreviewDataAction(data: any) {
    const events = this.processSpecs(data.jsonData);
    const parsedFailureEvents = unfixedableJsonString;

    const combinedData = events.map((event: any) => {
      return {
        Spec: JSON.parse(JSON.stringify(event, null, 2)),
        FailureEvent: null, // No failure here
      };
    });

    // Include your parsedFailureEvents here
    combinedData.push({
      Spec: null, // No spec here
      FailureEvent: parsedFailureEvents as any,
    });

    this.displayedDataSource$.next(combinedData);
    this.displayedColumns$.next(['Spec', 'FailureEvent']);

    console.log(this.displayedDataSource$.getValue());

    if (this.displayedDataSource$.getValue()[0].Spec === null) {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          message: `No events found in the selected colulmn. Please select another sheet and try again.`,
        },
      });
    }
  }

  getNumTotalEvents() {
    return this.dataSource$.pipe(
      map((data) => {
        return data.length;
      })
    );
  }

  getNumParsedEvents() {
    return this.displayedDataSource$.pipe(
      map((data) => {
        // note the reason for -1 is because the last row is the failure events as an array
        return data.length - 1;
      })
    );
  }

  private handleExtractSpecsAction(data: any): any {
    this.processAndSetSpecsContent(data.jsonData);
  }

  processSpecs(data: DataRow[]): any[] {
    const gtmSpecs = filterGtmSpecsFromData(data);
    const cleanedGtmSpecs = gtmSpecs.map((spec) => {
      try {
        return convertSpecStringToObject(spec);
      } catch (error) {
        this.dialog.open(ErrorDialogComponent, {
          data: {
            message: `Failed to parse the following spec: ${spec}`,
          },
        });
      }
    });
    return cleanedGtmSpecs.filter((spec) => spec && spec.event);
  }

  processAndSetSpecsContent(data: DataRow[]): void {
    const events = this.processSpecs(data);
    this.editorService.setContent('inputJson', JSON.stringify(events, null, 2));
  }

  getIsRenderingJson() {
    return this.isRenderingJson$.asObservable();
  }

  setIsRenderingJson(isRenderingJson: boolean) {
    this.isRenderingJson$.next(isRenderingJson);
  }

  getIsPreviewing() {
    return this.isPreviewing$.asObservable();
  }

  setIsPreviewing(isPreviewing: boolean) {
    this.isPreviewing$.next(isPreviewing);
  }

  resetAllData() {
    this.workbook$.next(null);
    this.worksheetNames$.next(['']);
    this.fileName$.next('');
    this.dataSource$.next([]);
    this.displayedDataSource$.next([]);
    this.displayedColumns$.next([]);
    this.isRenderingJson$.next(false);
    this.isPreviewing$.next(true);
  }
}
