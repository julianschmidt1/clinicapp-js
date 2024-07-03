import { Component, Input, OnInit, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PatientHistoryService } from '../../services/patient-history.service';
import { PatientHistory } from '../../models/patient-history.model';
import { CommonModule } from '@angular/common';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { AppointmentModel } from '../../models/appointment.model';

@Component({
  selector: 'patient-history-detail',
  standalone: true,
  imports: [
    InputTextModule,
    CommonModule
  ],
  templateUrl: './patient-history-detail.component.html',
  styleUrl: './patient-history-detail.component.scss'
})
export class PatientHistoryDetailComponent implements OnInit {

  @Input() userId: string;

  private _patientHistoryService = inject(PatientHistoryService);

  private _firestore = inject(Firestore);

  public historyData: PatientHistory;
  public historyDataLoading = false;
  public relatedAppointments: AppointmentModel[] = [];

  ngOnInit(): void {
    const appointmentsCollection = collection(this._firestore, 'appointments');

    this.historyDataLoading = true;
    this._patientHistoryService.getHistoryById(this.userId)
      .then((data) => {
        if (data.exists()) {
          this.historyData = data.data() as PatientHistory;

          collectionData(appointmentsCollection)
            .pipe(map((appointments: AppointmentModel[]) => {
              return appointments.filter(a => this.historyData.appointmentIds.includes(a.id))
            }))
            .subscribe({
              next: (appointments) => {
                console.log('appointments: ', appointments);
                this.relatedAppointments = appointments;
              },
              error: (e) => {
                this.historyDataLoading = false;
                console.log('Error: ', e);
              }
            })
        }
      })
      .finally(() => {
        this.historyDataLoading = false;
      })
      .catch((e) => {
        this.historyDataLoading = false;
        console.log('Error: ', e);

      })
  }
}
