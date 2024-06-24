import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { AppointmentsTableComponent } from '../../components/appointments-table/appointments-table.component';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';

@Component({
  selector: 'app-all-appointments',
  standalone: true,
  imports: [
    ToastModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CommonModule,
    FormsModule,
    AppointmentsTableComponent,
    ArrowBackComponent
  ],
  templateUrl: './all-appointments.component.html',
  styleUrl: './all-appointments.component.scss'
})
export class AllAppointmentsComponent implements OnInit {

  private _authService = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);
  private _firestore = inject(Firestore);

  public dialogVisible = false;
  public loadingModal = false;
  public actionData;
  public reason: string;
  public currentUser;

  public allAppointments: AppointmentModel[] = [];
  public appointmentsLoading = false;

  ngOnInit(): void {

    const appointmentsCollection = collection(this._firestore, 'appointments');
    const currentUserData = this._authService.getCurrentUserData();

    this.appointmentsLoading = true;
    this._authService.getUserById(currentUserData.uid)
      .then((data) => {
        this.currentUser = data.data();
      })
      .finally(() => {

        collectionData(appointmentsCollection)
          .subscribe({
            next: (appointments: AppointmentModel[]) => {
              console.log(appointments);
              this.allAppointments = appointments;
              this.appointmentsLoading = false;
            },
            error: () => {
              this._toastService.errorMessage('Error al cargar turnos');
              this.appointmentsLoading = false;
            }
          });

      })

  }

  public handleConfirmDialog(): void {
    this.loadingModal = true
    const updatedAppointment = {
      ...this.actionData.appointment,
      status: this.actionData.action,
      reason: this.reason,
    }
    
    // cuando cancelas el turno el estado del horario vuelve a libre
    if (this.actionData.action === AppointmentStatus.Cancelled) {
      const { appointment } = this.actionData;
      const { day, time, specialistId } = appointment;

      this._authService.getUserById(specialistId)
        .then(data => {
          const specialist = data.data();
          const { schedule } = specialist;

          let appointmentToUpdate = schedule.find((ap: AppointmentModel) => ap.day === day && ap.time === time);

          const updatedSchedule = [
            ...schedule.filter((ap: AppointmentModel) => ap.day !== day && ap.time !== time),
            {
              ...appointmentToUpdate,
              busy: false,
            }
          ];

          this._authService.updateUser({
            ...specialist,
            schedule: updatedSchedule
          });
        })
    }

    this._appointmentService.updateAppointment(updatedAppointment)
      .then(() => {
        this._toastService.successMessage('Turno cancelado con exito');
        this.dialogVisible = false;
        this.loadingModal = false;
        this.actionData = undefined;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al cancelar el turno');
        this.loadingModal = false;
      });
  }

  public handleActionClick(event): void {
    console.log(event)
    this.actionData = event;
    if(event.action === AppointmentStatus.Cancelled) {
      this.dialogVisible = true;
    }
  }
}
