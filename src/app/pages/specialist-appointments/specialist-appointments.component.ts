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
import { getFilteredAppointments } from '../../helpers/appointmentFilter.helper';
import { PatientHistory } from '../../models/patient-history.model';

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

  // patient history
  public loadPatientHistoryVisible = false;
  public patientHistory: Partial<PatientHistory> = {
    height: null,
    weight: null,
    temperature: null,
    pressure: null,
  };

  // filters
  public filterCriteria: string = '';
  public patients = [];

  ngOnInit(): void {

    const appointmentsCollection = collection(this._firestore, 'appointments');
    const usersCollection = collection(this._firestore, 'users');
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

        collectionData(usersCollection)
          .pipe(
            map((users: any[]) => {
              return users.filter((user) => user?.healthcare);
            })
          )
          .subscribe({
            next: (users) => {
              this.patients = users;
            }
          });

      })

  }

  public handleActionClick(event): void {
    // const { specialistId, day, time } = event.appointment;
    if (!event.action) {
      this.actionData = event;
      this.commentsDialogVisible = true;
      return;
    }

    if (event.action === 'patient-history') {
      console.log(event);
      this.loadPatientHistoryVisible = true;
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

    // this._authService.getUserById(specialistId)
    //   .then(data => {
    //     const specialist = data.data();
    //     const { schedule } = specialist;

    //     let appointmentToUpdate = schedule.find((ap: AppointmentModel) => ap.day === day && ap.time === time);

    //     const updatedSchedule = [
    //       ...schedule.filter((ap: AppointmentModel) => ap.day !== day && ap.time !== time),
    //       {
    //         ...appointmentToUpdate,
    //         busy: true,
    //       }
    //     ];

    //     this._authService.updateUser({
    //       ...specialist,
    //       schedule: updatedSchedule
    //     }).then(() => {
    //     });
    //   })
  }

  public handleConfirmPatientHistory(): void {
    const { height, weight, temperature, pressure } = this.patientHistory;
    if(!height || !weight || !temperature || !pressure) {
      this._toastService.errorMessage('Debe cargar: Altura, Peso, Temperatura, Presión');
      return;
    }
    console.log(this.patientHistory)
  }

  public handleConfirmDialog(): void {
    if(!this.reason) {
      this._toastService.errorMessage('Debe proporcionar un motivo.');
      return;
    }

    this.loadingModal = true;
    const updatedAppointment = {
      ...this.actionData.appointment,
      status: this.actionData.action,
      reason: this.reason,
    }

    // cuando cancelas el turno el estado del horario vuelve a libre
    // if (this.actionData.action === AppointmentStatus.Cancelled) {
    //   const { appointment } = this.actionData;
    //   const { day, time, specialistId } = appointment;

    //   this._authService.getUserById(specialistId)
    //     .then(data => {
    //       const specialist = data.data();
    //       const { schedule } = specialist;

    //       let appointmentToUpdate = schedule.find((ap: AppointmentModel) => ap.day === day && ap.time === time);

    //       const updatedSchedule = [
    //         ...schedule.filter((ap: AppointmentModel) => ap.day !== day && ap.time !== time),
    //         {
    //           ...appointmentToUpdate,
    //           busy: false,
    //         }
    //       ];

    //       this._authService.updateUser({
    //         ...specialist,
    //         schedule: updatedSchedule
    //       });
    //     })
    // }

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

  public getFilteredAppointments() {
    return getFilteredAppointments(this.filterCriteria, this.allAppointments, this.patients, 'patientId');
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
