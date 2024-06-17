import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StorageService } from './firebase-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private _auth = inject(Auth);
  private firestore = inject(Firestore);
  private storageService = inject(StorageService);

  async register(form: any, userType, initiallyDisabled = true): Promise<boolean> {

    console.log(form);
    let userData;

    const { firstName, lastName, dni, email, password, healthcare, specialty, attachedImage } = form;

    const attachedFilesPath = this.storageService.uploadFile(attachedImage, email);

    const baseUserData = {
      firstName,
      lastName,
      dni,
      email,
      attachedImage: attachedFilesPath
    };

    switch (userType) {
      case 'patient':
        userData = {
          ...baseUserData,
          healthcare,
          disabled: initiallyDisabled,
        }
        break;
      case 'specialist':
        userData = {
          ...baseUserData,
          specialty,
          disabled: initiallyDisabled,
        }
        break;
      case 'admin':
        userData = {
          ...baseUserData,
          admin: true,
          disabled: initiallyDisabled,
        }
        break;
    }


    createUserWithEmailAndPassword(this._auth, email, password)
      .then((newUser) => {
        // const usersCollection = collection(this._firestore, 'users');
        const userId = newUser.user.uid;

        sendEmailVerification(newUser.user);
        setDoc(doc(this.firestore, 'users', userId), { ...userData, id: userId });
        return true;
      })

    return false;
  }


  public getCurrentUserData(): any {

    const rawUser = localStorage.getItem('user');

    if (rawUser) {
      const userData = JSON.parse(rawUser);
      return userData;
    }

    return null;
  }

  public usersCollection(): Observable<any> {
    const userDocRef = collection(this.firestore, `users`);
    return collectionData(userDocRef)
  }
}

function convertImageToBase64(imageFile: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
      const base64Image = reader.result as string;
      resolve(base64Image);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}
