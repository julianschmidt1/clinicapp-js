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
import { getFilteredAppointments, getFilteredAppointmentsByAllFields } from '../../helpers/appointmentFilter.helper';
import { KeyValuePair, PatientHistory } from '../../models/patient-history.model';
import { TooltipModule } from 'primeng/tooltip';
import moment from 'moment';
import { PatientHistoryService } from '../../services/patient-history.service';

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
    ArrowBackComponent,
    TooltipModule
  ],
  templateUrl: './specialist-appointments.component.html',
  styleUrl: './specialist-appointments.component.scss'
})
export class SpecialistAppointmentsComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _authService = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);
  private _patientHistoryService = inject(PatientHistoryService);

  public allAppointments: any[] = [];
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
    appointmentId: null,
    customProperties: [],
  };

  public loadingPatientHistory = false;
  public selectedAppointment: AppointmentModel;
  public currentHistory: PatientHistory;

  // dynamic form data
  public dynamicValues = {};
  public newFieldName = '';
  public addingValue = false;
  public newFields = [];

  // filters
  public filterCriteria: string = '';
  public patients = [];

  ngOnInit(): void {

    const appointmentsCollection = collection(this._firestore, 'appointments');
    const usersCollection = collection(this._firestore, 'users');
    const patientHistoryCollection = collection(this._firestore, 'patientHistory');

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

              console.log(appointments);

              collectionData(patientHistoryCollection)
                .subscribe({
                  next: (data: any) => {
                    
                    const relatedAppointments = this.allAppointments.map((a) => {
                      
                      const relatedParentHistory = data.find(d => d.history.some(ph => ph.patientId === a.patientId))

                      if (!relatedParentHistory) {
                        return { ...a };
                      }

                      return { ...a, relatedParentHistory };
                    });

                    this.allAppointments = relatedAppointments;
                  }
                });
              this.loadingAppointments = false;
            },
            error: () => {
              this._toastService.errorMessage('Error al cargar turnos');
            }
          });

        collectionData(usersCollection)
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
      const { patientId, id } = event.appointment;

      this.patientHistory.appointmentId = id;
      this.patientHistory.patientId = patientId;
      this.patientHistory.id = `history-${patientId}`;
      this.selectedAppointment = event.appointment;
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
    if (!height || height < 0 || !weight || weight < 0 || !temperature || temperature < 0 || !pressure || pressure < 0) {
      this._toastService.errorMessage('Debe cargar: Altura, Peso, Temperatura, Presión');
      return;
    }

    if (this.newFields.some(f => !this.dynamicValues[f.prop])) {
      this._toastService.errorMessage('Los valores dinamicos son requeridos.');
      return;
    }

    if (this.newFields?.length) {

      this.newFields.map((field) => {

        this.patientHistory.customProperties.push({
          key: field.prop,
          displayName: field.displayName,
          value: this.dynamicValues[field.prop]
        });

      });
    }

    this.loadingPatientHistory = true;

    this._patientHistoryService.setPatientHistory(this.patientHistory)
      .then(() => {
        this._toastService.successMessage('Historia clinica cargada con exito');
        this.loadPatientHistoryVisible = false;
        this.loadingPatientHistory = false;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al cargar historia clinica');
        this.loadingPatientHistory = false;
      });

    this._appointmentService.updateAppointment({ ...this.selectedAppointment, hasHistory: true })
      .then(() => { })
      .catch(() => {
        this._toastService.errorMessage('Error al actualizar el turno');
      })
  }

  public handleAddField(): void {

    const newPropName = this.newFieldName.replaceAll(' ', '').toLowerCase().trim();
    this.newFields.push({
      prop: newPropName,
      displayName: this.newFieldName.trim(),
    });

    this.dynamicValues = {
      ...this.dynamicValues,
      [newPropName]: '',
    }

    this.addingValue = false;
    this.newFieldName = '';
  }

  public handleConfirmDialog(): void {
    if (!this.reason) {
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
    return getFilteredAppointmentsByAllFields(this.filterCriteria, this.allAppointments, this.patients, 'patientId');
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
