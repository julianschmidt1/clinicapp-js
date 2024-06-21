import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  public currentUser;
  public currentUserLoading = true;
  private firestore = inject(Firestore);
  private router = inject(Router);

  ngOnInit(): void {
    const rawUser = localStorage.getItem('user');

    if (!rawUser) {
      return;
    }

    const user = JSON.parse(rawUser);
    this.currentUser = user;
    const userRef = doc(this.firestore, `users/${user.uid}`);

    onSnapshot(userRef, async (userDocument) => {
      if (!userDocument.exists()) {
        return;
      }

      const retrievedUserData = userDocument.data() as any;
      this.currentUser = retrievedUserData;
      this.currentUserLoading = false;

    });
  }

  public handleNavigate(path: string): void {
    this.router.navigateByUrl('auth/' + path);
  }

}
