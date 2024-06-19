import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { StorageService } from '../../services/firebase-storage.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private firestore = inject(Firestore)
  private storageService = inject(StorageService)

  public loadingUser = true;
  public loadingImages = true;

  public userImages = [];
  public userData;

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUserData = JSON.parse(storedUser);
      const userRef = doc(this.firestore, `users/${parsedUserData.uid}`);

      getDoc(userRef).then(async (userDocument) => {
        if (userDocument.exists()) {
          console.log(userDocument.data());
          const retrievedUserData = userDocument.data() as any;
          this.userData = retrievedUserData;
          this.loadingUser = false;

          const imagePromises = this.storageService.getUserFiles(retrievedUserData.attachedImage);
          const imagePath = await Promise.all(imagePromises);

          this.loadingImages = false;

          const images = imagePath.map((i, index) => {
            const displayImageObject = { path: i, foreground: !Boolean(index) };

            return displayImageObject;
          })
          this.userImages = images;

        }

      })
    }
  }

  handleClickImage(image: { foreground: boolean, path: string }) {
    if (this.userImages.length > 1) {
      this.userImages = [
        { ...this.userImages[1], foreground: true },
        { ...this.userImages[0], foreground: false },
      ]
    }

  }


}
