import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'appointments-table',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule
  ],
  templateUrl: './appointments-table.component.html',
  styleUrl: './appointments-table.component.scss'
})
export class AppointmentsTableComponent {
  @Input() appointments = [];
}
