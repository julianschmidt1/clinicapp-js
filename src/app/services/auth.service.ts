import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private _auth = inject(Auth);
  private firestore = inject(Firestore);

  async register(form: any, userType): Promise<boolean> {

    console.log(form);
    const { firstName, lastName, dni, email, password, healthcare, specialty, attachedImage } = form;

    const filePromises = attachedImage.map((file: File) => {
      return convertImageToBase64(file);
    })

    const convertedFiles = await Promise.all(filePromises)

    const baseUserData = {
      firstName,
      lastName,
      dni,
      email,
      attachedImage: convertedFiles
    };

    let userData;

    if (userType === 'patient') {
      userData = {
        ...baseUserData,
        healthcare
      }
    } else {
      userData = {
        ...baseUserData,
        specialty,
        disabled: true,
      }
    }

    createUserWithEmailAndPassword(this._auth, email, password)
      .then((newUser) => {
        // const usersCollection = collection(this._firestore, 'users');
        const userId = newUser.user.uid;
        // newUser.user.

        sendEmailVerification(newUser.user);
        setDoc(doc(this.firestore, 'users', userId), { ...userData, id: userId, admin: false });
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
