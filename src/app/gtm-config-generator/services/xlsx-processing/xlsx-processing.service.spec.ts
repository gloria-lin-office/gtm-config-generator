import { TestBed } from '@angular/core/testing';

import { XlsxProcessingService } from './xlsx-processing.service';

describe('XlsxProcessingService', () => {
  let service: XlsxProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XlsxProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
