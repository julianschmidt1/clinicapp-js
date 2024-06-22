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

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    CommonModule,
    DateToDayNumberPipe,
    ButtonModule
  ],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.scss'
})
export class CreateAppointmentComponent implements OnInit {

  private _firestore = inject(Firestore);

  //options
  public allSpecialties = [];
  public specialists = [];

  // selectedValues
  public selectedSpecialty: string;
  public selectedSpecialist;
  public selectedSpecialistSchedule = [];
  public selectedDateTime: ScheduleModel = { time: '', day: '' };

  // loading
  public loadingSpecialties = false;
  public loadingSpecialists = false;

  ngOnInit(): void {
    const specialtiesCollection = collection(this._firestore, 'specialties');
    this.loadingSpecialties = true;

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

  public handleChangeSpecialist(event: DropdownChangeEvent): void {
    const selectedSpecialist = this.specialists.find(specialist => specialist.id === event.value);
    const sortedSchedule = groupAndSortSchedule(selectedSpecialist.schedule);
    this.selectedSpecialistSchedule = sortedSchedule;

  }

  public handleSelectTime(dayData: ScheduleModel): void {
    this.selectedDateTime = dayData;
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
