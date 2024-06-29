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
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';
import { Router } from '@angular/router';
import { StorageService } from '../../services/firebase-storage.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    CommonModule,
    DateToDayNumberPipe,
    ButtonModule,
    ToastModule,
    ArrowBackComponent,
    TooltipModule
  ],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.scss'
})
export class CreateAppointmentComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _auth = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);
  private _router = inject(Router);
  private _storageService = inject(StorageService);

  public currentUser;

  //options
  public allSpecialties = [];
  public specialists = [];
  public patients = [];

  // selectedValues
  public selectedSpecialty: string;
  public selectedSpecialist;
  public selectedPatient;

  public selectedSpecialistDay: string;
  // public selectedSpecialistSchedule = [];

  public selectedDateTime: ScheduleModel = { time: '', day: '', busy: false, };

  // loading
  public loadingSpecialties = false;
  public loadingSpecialists = false;
  public loadingUsers = false;
  public createAppointmentLoading = false;

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

        const allPaths = this.allSpecialties.map(s => {
          if (!s?.attachedFilePath) return null;

          return s?.attachedFilePath.find(d => d);
        });

        const imagePromises = this._storageService.getUserFiles(allPaths)
        Promise.all(imagePromises)
          .then(data => {
            data.forEach((path, index) => {
              this.allSpecialties[index].attachedFilePath = path;
            })
          })

        this.loadingSpecialties = false;
      },
      error: (error) => {
        this.loadingSpecialties = false;
        this.allSpecialties = [];
      }
    });
  }

  handleSubmit(): void {
    this.createAppointmentLoading = true;

    const appointment: AppointmentModel = {
      specialty: this.selectedSpecialty,
      specialistId: this.selectedSpecialist,
      patientId: this.selectedPatient,
      status: AppointmentStatus.Pending,
      // ...this.selectedDateTime,
      day: this.selectedDateTime.day,
      time: this.selectedDateTime.time,
    };

    this._appointmentService.addAppointment(appointment)
      .then(() => {
        this._toastService.successMessage('Turno creado con exito.');
        this.createAppointmentLoading = false;
        let path: string;

        if (this.currentUser?.admin) {
          path = 'all-appointments';
        }

        if (this.currentUser?.healthcare) {
          path = 'patient-appointments';
        }

        this._router.navigateByUrl('auth/' + path);

      })
      .catch(() => {
        this._toastService.errorMessage('Ocurrio un error al crear el turno.');
        this.createAppointmentLoading = false;
      })

  }

  public handleSelectTime(dayData: ScheduleModel): void {
    this.selectedDateTime = dayData;
    if (!this.currentUser?.admin) {
      this.selectedPatient = this.currentUser.id;
    }
  }

  public handleChangeSpecialty(specialtyName: string): void {

    const specialtiesCollection = collection(this._firestore, 'users');
    this.loadingSpecialists = true;

    collectionData(specialtiesCollection)
      .pipe(first())
      .subscribe({
        next: (users) => {
          const selectedSpecialtyUsers = users.filter((user) => user['specialty']?.includes(specialtyName))
          this.specialists = selectedSpecialtyUsers.map((specialist: any) => ({ ...specialist, displayName: specialist.firstName + ' ' + specialist.lastName }));

          if (this.specialists.length) {
            this.selectedSpecialty = specialtyName;
          } else {
            this._toastService.warningMessage('La especialidad seleccionada no tiene profesionales.', '¡Lo sentimos!')
          }

          this.loadingSpecialists = false;

          this.getSpecialistImages();
        },
        error: (error) => {
          console.log('error', error);
          this.loadingSpecialists = false;
          this._toastService.errorMessage('Ocurrio un error al seleccionar especialidad')
          this.specialists = [];
        }
      });
  }

  private getSpecialistImages(): void {
    const allPaths = this.specialists.map(s => {
      if (!s?.attachedImage) return null;

      return s?.attachedImage.find(d => d);
    });

    const imagePromises = this._storageService.getUserFiles(allPaths)

    Promise.all(imagePromises)
      .then(data => {
        data.forEach((path, index) => {
          this.specialists[index].attachedImage = path;
        })
      })
  }

  public handleChangeSpecialist(user): void {
    console.log('user: ', user);

    // const sortedSchedule = groupAndSortSchedule(user.schedule);
    if (!user.schedule.length) {
      this._toastService.warningMessage('El especialista seleccionado no tiene turnos disponibles', '¡Lo sentimos!');
      return;
    }

    user.schedule.sort((a, b) => {
      return new Date(a.day).getDate() - new Date(b.day).getDate();
    })
    this.selectedSpecialist = user;

    // const daysWithSchedule = sortedSchedule.map(([key, value]: [string, ScheduleModel[]]) => {
    //   return [
    //     key,
    //     value.filter((a) => !a.busy)
    //   ]
    // });
    // console.log(daysWithSchedule);

    // this.selectedSpecialistSchedule = daysWithSchedule.filter(([_, value]: [string, ScheduleModel[]]) => value.length);
  }

  public handleSetDay(dayData) {
    const { day, time } = dayData;
    this.selectedSpecialistDay = day;

    const scheduleIntervals = this.generateTimeIntervals(time.start, time.end, day);
    
    console.log('IN: ',scheduleIntervals);
  }

  public generateTimeIntervals(startTime: string, endTime: string, day: string) {
    const intervals: string[] = [];

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let current = new Date();
    current.setHours(startHour);
    current.setMinutes(startMinute);

    const end = endHour * 60 + endMinute;

    while (true) {
      const hour = ('0' + current.getHours()).slice(-2);
      const minute = ('0' + current.getMinutes()).slice(-2);
      intervals.push(`${hour}:${minute}`);

      current.setMinutes(current.getMinutes() + 30);

      if (current.getHours() * 60 + current.getMinutes() > end) {
        break;
      }
    }

    return intervals.map(i => ({
      time: i,
      day: day
    }));

  }

}
