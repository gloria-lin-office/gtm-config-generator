import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarComponent } from '../bar/bar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, BarComponent],
})
export class HeaderComponent {}
