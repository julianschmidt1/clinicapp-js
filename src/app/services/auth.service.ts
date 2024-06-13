import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, addDoc, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private _auth = inject(Auth);
  private _firestore = inject(Firestore);

  async register(form: any) {

    console.log(form);
    const { firstName, lastName, dni, email, type, password, healthcare, specialty, attachedImage } = form;

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

    if (type.value === 2) {
      userData = {
        ...baseUserData,
        healthcare
      }
    } else {
      userData = {
        ...baseUserData,
        specialty
      }
    }

    createUserWithEmailAndPassword(this._auth, email, password)
      .then((newUser) => {
        const usersCollection = collection(this._firestore, 'users');
        const userId = newUser.user.uid;

        setDoc(doc(this._firestore, 'users', userId), { ...userData, id: userId, admin: false });
      });

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
