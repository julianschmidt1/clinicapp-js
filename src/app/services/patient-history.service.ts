import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { PatientHistory } from '../models/patient-history.model';

@Injectable({
  providedIn: 'root'
})
export class PatientHistoryService {

  private firestore = inject(Firestore);

  constructor() { }

  public setPatientHistory(data: Partial<PatientHistory>): Promise<void> {
    console.log('Setting: ', data);
    return setDoc(doc(this.firestore, 'patientHistory', data.id), data);
  }

  public getHistoryById(id: string) {
    const docRef = doc(this.firestore, `patientHistory/history-${id}`);

    return getDoc(docRef);
  }
}
