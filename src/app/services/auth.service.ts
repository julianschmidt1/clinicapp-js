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

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this._auth, email, password)
      .then((newUser) => {
        const usersCollection = collection(this._firestore, 'users');

        console.log('NEW USER: ', newUser.user.uid);
        console.log('COLLECTION : ', usersCollection);

        // addDoc(usersCollection, ).
        setDoc(doc(this._firestore, 'users', newUser.user.uid),
          {
            firstName: 'Test uno',
            lastName: 'Teste',
            email,
            age: 45,
            dni: 43000312,
            image: '',
          }
        );



      })
    // return this.auth.createUserWithEmailAndPassword()
  }
}

