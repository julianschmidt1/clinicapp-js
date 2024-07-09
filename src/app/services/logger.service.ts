import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection } from '@angular/fire/firestore';
import moment from 'moment'; // Importar moment.js

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private firestore = inject(Firestore);

  createLog(username: string): Promise<DocumentReference> {
    let logsCollection = collection(this.firestore, 'userLogs');
    const now = moment();

    const date = now.format('YYYY-MM-DD');
    const time = now.format('HH:mm:ss');

    return addDoc(logsCollection, { 
      username, 
      date,
      time
    });
  }
}
