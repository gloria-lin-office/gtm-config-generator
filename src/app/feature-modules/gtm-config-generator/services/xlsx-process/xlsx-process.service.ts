import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { WebWorkerService } from 'src/app/services/web-worker/web-worker.service';
import { WorkbookService } from '../workbook/workbook.service';
import { XlsxDisplayService } from '../xlsx-display/xlsx-display.service';
import { FileService } from '../file/file.service';

@Injectable({
  providedIn: 'root',
})
export class XlsxProcessService {
  workbook$ = this.workbookService.workbook$;
  worksheetNames$ = this.workbookService.worksheetNames$;
  fileName$ = this.workbookService.fileName$;
  dataSource$ = this.xlsxDisplayService.dataSource$;
  displayedDataSource$ = this.xlsxDisplayService.displayedDataSource$;
  displayedColumns$ = this.xlsxDisplayService.displayedColumns$;
  isRenderingJson$ = this.xlsxDisplayService.isRenderingJson$;
  isPreviewing$ = this.xlsxDisplayService.isPreviewing$;

  constructor(
    private webWorkerService: WebWorkerService,
    private workbookService: WorkbookService,
    private fileService: FileService,
    private xlsxDisplayService: XlsxDisplayService
  ) {}

  async loadXlsxFile(file: File) {
    try {
      const fileData = await this.fileService.loadFile(file);
      this.initializeDataProcessing();

      this.webWorkerService.postMessage('message', {
        action: 'readXlsx',
        data: fileData,
      });
      this.fileName$.next(file.name);
    } catch (error) {
      console.error(error);
    }
  }

  initializeDataProcessing() {
    // Logic from processXlsxData
    this.webWorkerService
      .onMessage()
      .pipe(
        tap((data) => {
          if (data.action === 'readXlsx') {
            this.workbookService.handleReadXlsxAction(data);
            this.xlsxDisplayService.handleReadXlsxAction(data);
          } else if (data.action === 'switchSheet') {
            this.xlsxDisplayService.handleSwitchSheetAction(data);
          } else if (data.action === 'previewData') {
            this.xlsxDisplayService.handlePreviewDataAction(data);
          } else if (data.action === 'extractSpecs') {
            this.xlsxDisplayService.processAndSetSpecsContent(data.jsonData);
          }
        })
      )
      .subscribe();
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

  getIsRenderingJson() {
    return this.isRenderingJson$.asObservable();
  }

  setIsRenderingJson(isRenderingJson: boolean) {
    this.xlsxDisplayService.setIsRenderingJson(isRenderingJson);
  }

  getIsPreviewing() {
    return this.isPreviewing$.asObservable();
  }

  setIsPreviewing(isPreviewing: boolean) {
    this.xlsxDisplayService.setIsPreviewing(isPreviewing);
  }

  resetAllData() {
    this.workbookService.resetWorkbookData();
    this.xlsxDisplayService.resetDisplayData();
  }
}
