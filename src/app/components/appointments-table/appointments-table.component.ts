import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { UserIdToFullname } from '../../pipes/userIdToFullname.pipe';
import { CommonModule } from '@angular/common';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';

@Component({
  selector: 'appointments-table',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    UserIdToFullname,
    CommonModule
  ],
  templateUrl: './appointments-table.component.html',
  styleUrl: './appointments-table.component.scss'
})
export class AppointmentsTableComponent {
  @Input() appointments: AppointmentModel[] = [];
  @Input() userType: string;
  @Output() onActionClick = new EventEmitter<any>();
  @Input() loading = false;

  public status = AppointmentStatus;

  public handleActionClick(appointment: AppointmentModel, action?: AppointmentStatus | string): void {

    this.onActionClick.emit({
      appointment,
      action
    });
  }

  public getClassByStatus(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Cancelled:
        return 'cancelled';
      case AppointmentStatus.Done:
        return 'done';
      case AppointmentStatus.Confirmed:
        return 'confirmed';
      case AppointmentStatus.Pending:
        return 'pending';
      case AppointmentStatus.Rejected:
        return 'rejected';
    }
  }
}
