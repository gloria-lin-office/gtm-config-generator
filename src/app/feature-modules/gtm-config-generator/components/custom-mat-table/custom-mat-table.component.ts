import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { XlsxProcessService } from '../../services/xlsx-process/xlsx-process.service';
import { SharedModule } from '../../../../shared.module';

@Component({
  selector: 'app-custom-mat-table',
  standalone: true,
  imports: [SharedModule],
  template: `
    <ng-container *ngIf="displayedDataSource$ | async as dataSource">
      <table mat-table [dataSource]="dataSource">
        <ng-container
          matColumnDef="{{ column }}"
          *ngFor="let column of displayedColumns$ | async"
        >
          <th mat-header-cell *matHeaderCellDef>
            {{ column.replace('__EMPTY', 'empty_title') }}
          </th>
          <td mat-cell *matCellDef="let element">
            <pre
              *ngIf="xlsxProcessService.getIsRenderingJson() | async"
              style="padding: 5px 0"
              >{{ element[column] | json }} </pre
            >
            <div *ngIf="!(xlsxProcessService.getIsRenderingJson() | async)">
              {{ element[column] }}
            </div>
          </td>
          ></ng-container
        >

        <tr mat-header-row *matHeaderRowDef="displayedColumns$ | async"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns$ | async"
        ></tr>
      </table>
    </ng-container>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomMatTableComponent {
  @Input() displayedDataSource$!: Observable<any[]>;
  @Input() displayedColumns$!: Observable<string[]>;

  constructor(public xlsxProcessService: XlsxProcessService) {}
}
