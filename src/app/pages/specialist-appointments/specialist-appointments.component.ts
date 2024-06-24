import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { map } from 'rxjs';
import { AppointmentsTableComponent } from '../../components/appointments-table/appointments-table.component';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';

@Component({
  selector: 'app-specialist-appointments',
  standalone: true,
  imports: [
    AppointmentsTableComponent,
    InputTextModule,
    FormsModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    CommonModule,
    ArrowBackComponent
  ],
  templateUrl: './specialist-appointments.component.html',
  styleUrl: './specialist-appointments.component.scss'
})
export class SpecialistAppointmentsComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _authService = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);

  public allAppointments: AppointmentModel[] = [];
  public currentUser;
  public loadingAppointments = false;

  // Confirmation dialog
  public dialogVisible = false;
  public reason = '';
  public actionData;
  public loadingModal = false;

  public commentsDialogVisible = false;

  public filter: string = '';

  ngOnInit(): void {

    const appointmentsCollection = collection(this._firestore, 'appointments');
    const currentUserData = this._authService.getCurrentUserData();
    this.loadingAppointments = true;

    this._authService.getUserById(currentUserData.uid)
      .then((data) => {
        this.currentUser = data.data();
      })
      .finally(() => {

        collectionData(appointmentsCollection)
          .pipe(
            map((appointment: AppointmentModel[]) => {

              return appointment.filter((a) => a.specialistId === this.currentUser.id);
            })
          )
          .subscribe({
            next: (appointments) => {
              console.log(appointments);
              this.allAppointments = appointments;
              this.loadingAppointments = false;
            },
            error: () => {
              this._toastService.errorMessage('Error al cargar turnos');
            }
          });

      })

  }

  public getRows() {
    if (this.filter.trim().length === 0) {
    }

    return this.allAppointments;
    // return this.allAppointments.filter(a => );
  }

  public handleActionClick(event): void {

    const { specialistId, day, time } = event.appointment;

    if (!event.action) {
      this.actionData = event;
      this.commentsDialogVisible = true;
      return;
    }

    if (
      event.action === AppointmentStatus.Cancelled ||
      event.action === AppointmentStatus.Rejected ||
      event.action === AppointmentStatus.Done
    ) {
      this.actionData = event;
      this.dialogVisible = true;
      return;
    }

    this._authService.getUserById(specialistId)
      .then(data => {
        const specialist = data.data();
        const { schedule } = specialist;

        let appointmentToUpdate = schedule.find((ap: AppointmentModel) => ap.day === day && ap.time === time);

        const updatedSchedule = [
          ...schedule.filter((ap: AppointmentModel) => ap.day !== day && ap.time !== time),
          {
            ...appointmentToUpdate,
            busy: true,
          }
        ];

        this._authService.updateUser({
          ...specialist,
          schedule: updatedSchedule
        }).then(() => {

          const updatedAppointment = {
            ...event.appointment,
            status: event.action
          }

          this._appointmentService.updateAppointment(updatedAppointment)
            .then(() => {
              this._toastService.successMessage('Turno actualizado con exito');
            })
            .catch(() => {
              this._toastService.errorMessage('Error al actualizar el turno');
            });

        });
      })
  }

  public handleConfirmDialog(): void {
    this.loadingModal = true;
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
        this._toastService.successMessage('Turno actualizado con exito');
        this.dialogVisible = false;
        this.loadingModal = false;
        this.actionData = undefined;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al actualizar el turno');
        this.loadingModal = false;
      });
  }

  public handleFilter(event: Event): void {
    console.log(event);
  }

  get modalText() {
    switch (this.actionData?.action) {
      case AppointmentStatus.Cancelled:
        return 'Cancelación';
      case AppointmentStatus.Rejected:
        return 'Rechazo';
      case AppointmentStatus.Done:
        return 'Finalización';
    }
    return '';
  }

}
