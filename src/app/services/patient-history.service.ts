import { Injectable, inject } from '@angular/core';
import { Firestore, arrayUnion, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { PatientHistory } from '../models/patient-history.model';

@Injectable({
  providedIn: 'root'
})
export class PatientHistoryService {

  private _firestore = inject(Firestore);

  constructor() { }

  public setPatientHistory(data: Partial<PatientHistory>): Promise<void> {

    const response = this.getHistoryById(data.patientId).then(d => {
      if (d.exists()) {
        return updateDoc(doc(this._firestore, 'patientHistory', data.id), {
          history: arrayUnion(data)
        })

      } else {

        return setDoc(doc(this._firestore, 'patientHistory', data.id), {
          history: [data],
        });
      }
    })

    return response;
  }

  public getHistoryById(id: string) {
    const docRef = doc(this._firestore, `patientHistory/history-${id}`);

    return getDoc(docRef);
  }
}
