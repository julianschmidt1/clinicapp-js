import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { AppointmentsTableComponent } from '../../components/appointments-table/appointments-table.component';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';
import { getFilteredAppointments, getFilteredAppointmentsByAllFields } from '../../helpers/appointmentFilter.helper';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PatientHistory } from '../../models/patient-history.model';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    AppointmentsTableComponent,
    ToastModule,
    DialogModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    RatingModule,
    ArrowBackComponent,
    SliderModule,
    CheckboxModule,
    RadioButtonModule
  ],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.scss'
})
export class PatientAppointmentsComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _authService = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);

  public allAppointments: any[] = [];
  public currentUser;
  public loadingAppointments = false;

  // Comment dialog
  public loadingModal = false;
  public dialogVisible = false;
  public actionData;
  public reason: string = '';

  public commentsDialogVisible = false;

  // Rating
  public ratingDialogVisible = false;
  public starsRating = 1;
  public ratingComment = '';

  // Survey
  public surveyDialogVisible = false;
  public surveyAnswers = {
    attention: 1,
    detail: 1,
    punctual: false,
    attribute: '',
  }

  //filters
  public filterCriteria: string = '';
  public specialists = [];

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
              return appointment.filter((a) => a.patientId === this.currentUser.id);
            })
          )
          .subscribe({
            next: (appointments) => {
              this.allAppointments = appointments;
              console.log(appointments);

              collectionData(patientHistoryCollection)
                .subscribe({
                  next: (data: PatientHistory[]) => {

                    const relatedAppointments = this.allAppointments.map((a) => {

                      const relatedParentHistory = data.find(ph => ph.patientId === a.patientId);

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
            error: (e) => {
              this._toastService.errorMessage('Error a cargar turnos');
            }
          });

        collectionData(usersCollection)
          // .pipe(
          //   map((users: any[]) => {
          //     return users.filter((user) => user?.specialty);
          //   })
          // )
          .subscribe({
            next: (users) => {
              this.specialists = users;
            }
          });

      });
  }

  public getFilteredAppointments() {
    const records = getFilteredAppointmentsByAllFields(this.filterCriteria, this.allAppointments, this.specialists, 'specialistId');

    return records;
  }

  handleActionClick(data) {
    this.actionData = data;

    if (data.action === 'survey') {
      this.surveyDialogVisible = true;
      return;
    }

    if (data.action === 'rating') {
      this.ratingDialogVisible = true;
      return;
    }

    if (data.action === 'comments') {
      this.commentsDialogVisible = true;
      return;
    }

    if (data.action === AppointmentStatus.Cancelled) {
      this.dialogVisible = true;
      return;
    }
  }

  handleConfirmSurvey(): void {

    if (!this.surveyAnswers.attribute) {
      this._toastService.errorMessage('Debe elegir por lo menos un atributo del especialista');
      return;
    }

    this.loadingModal = true;

    const updatedAppointment = {
      ...this.actionData.appointment,
      survey: this.surveyAnswers
    };

    this._appointmentService.updateAppointment(updatedAppointment)
      .then(() => {
        this._toastService.successMessage('Encuesta enviada con exito.');
        this.surveyDialogVisible = false;
        this.loadingModal = false;
        this.actionData = undefined;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al enviar encuesta.');
        this.loadingModal = false;
      });

  }

  public handleConfirmRating(): void {
    this.loadingModal = true;

    const updatedAppointment = {
      ...this.actionData.appointment,
      rating: {
        rating: this.starsRating,
        comment: this.ratingComment
      }
    };

    this._appointmentService.updateAppointment(updatedAppointment)
      .then(() => {
        this._toastService.successMessage('Calificacion enviada con exito');
        this.ratingDialogVisible = false;
        this.loadingModal = false;
        this.actionData = undefined;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al calificar el turno');
        this.loadingModal = false;
      });

    console.log(this.starsRating, this.ratingComment);

  }

  public handleConfirmDialog(): void {
    this.loadingModal = true
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

}
