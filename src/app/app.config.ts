import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({ "projectId": "clinicappjs", "appId": "1:606303822612:web:5b9f95e0232e57375b1801", "storageBucket": "clinicappjs.appspot.com", "apiKey": "AIzaSyBHLd2rRgPBAho_gItxpndsMIpqGBRbDL4", "authDomain": "clinicappjs.firebaseapp.com", "messagingSenderId": "606303822612" })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase())
  ]
};
