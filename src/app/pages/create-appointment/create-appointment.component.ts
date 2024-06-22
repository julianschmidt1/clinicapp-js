import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { first } from 'rxjs';
import { groupAndSortSchedule } from '../../helpers/parseModel.helper';
import { DateToDayNumberPipe } from '../../pipes/date-to-day-number.pipe';
import { ButtonModule } from 'primeng/button';
import { ScheduleModel } from '../profile/profile.component';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    CommonModule,
    DateToDayNumberPipe,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.scss'
})
export class CreateAppointmentComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _auth = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);

  public currentUser;

  //options
  public allSpecialties = [];
  public specialists = [];
  public patients = [];

  // selectedValues
  public selectedSpecialty: string;
  public selectedSpecialist;
  public selectedPatient;
  public selectedSpecialistSchedule = [];

  public selectedDateTime: ScheduleModel = { time: '', day: '' };

  // loading
  public loadingSpecialties = false;
  public loadingSpecialists = false;
  public loadingUsers = false;

  ngOnInit(): void {
    const specialtiesCollection = collection(this._firestore, 'specialties');
    const usersCollection = collection(this._firestore, 'users');
    const userId = this._auth.getCurrentUserData();
    this.loadingSpecialties = true;
    this.loadingUsers = true;

    collectionData(usersCollection)
      .subscribe({
        next: (users: any) => {
          this.currentUser = users.find(user => user.id === userId.uid);

          this.patients = users
            .filter(user => user.hasOwnProperty('healthcare'))
            .map(user => ({ ...user, displayName: user.firstName + ' ' + user.lastName }));
          this.loadingUsers = false;
        },
        error: (e) => {
          this.loadingUsers = false;
        }
      });


    collectionData(specialtiesCollection).subscribe({
      next: (data) => {
        this.allSpecialties = data;
        console.log(data)
        this.loadingSpecialties = false;
      },
      error: (error) => {
        this.loadingSpecialties = false;
        this.allSpecialties = [];
      }
    });
  }

  handleSubmit(): void {
    const appointment = {
      specialty: this.selectedSpecialty,
      specialistId: this.selectedSpecialist,
      patientId: this._auth.getCurrentUserData().uid,
      ...this.selectedDateTime,
    };

    this._appointmentService.addAppointment(appointment)
      .then(() => {
        this._toastService.successMessage('Turno creado con exito.');
      })
      .catch(() => {
        this._toastService.errorMessage('Ocurrio un error al crear el turno.');
      })
  }

  public handleChangeSpecialist(event: DropdownChangeEvent): void {
    const selectedSpecialist = this.specialists.find(specialist => specialist.id === event.value);
    const sortedSchedule = groupAndSortSchedule(selectedSpecialist.schedule);
    this.selectedSpecialistSchedule = sortedSchedule;
  }

  public handleSelectTime(dayData: ScheduleModel): void {
    this.selectedDateTime = dayData;
    if (!this.currentUser?.admin) {
      this.selectedPatient = this.currentUser.id;
    }
  }

  public handleChangeSpecialty(event: DropdownChangeEvent): void {
    console.log(event.value);

    const specialtiesCollection = collection(this._firestore, 'users');
    this.loadingSpecialists = true;
    collectionData(specialtiesCollection)
      .pipe(
        first(),
      )
      .subscribe({
        next: (users) => {
          const selectedSpecialtyUsers = users.filter((user) => user.hasOwnProperty('specialty') && user['specialty'].includes(event.value))

          this.specialists = selectedSpecialtyUsers.map((specialist: any) => ({ ...specialist, displayName: specialist.firstName + ' ' + specialist.lastName }));
          this.loadingSpecialists = false;
          console.log(selectedSpecialtyUsers);
        },
        error: (error) => {
          console.log('error', error);
          this.loadingSpecialists = false;
          this.specialists = [];
        }
      });
  }

}
