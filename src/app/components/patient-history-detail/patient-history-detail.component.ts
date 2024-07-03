import { Component, Input, OnInit, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PatientHistoryService } from '../../services/patient-history.service';
import { PatientHistory } from '../../models/patient-history.model';
import { CommonModule } from '@angular/common';

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
  public historyData: PatientHistory;

  ngOnInit(): void {
    this._patientHistoryService.getHistoryById(this.userId)
      .then((data) => {
        if (data.exists()) {
          console.log(data.data())
          this.historyData = data.data() as PatientHistory;
        }
      })
  }
}
