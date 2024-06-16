// storage.service.ts

import { Injectable } from '@angular/core';
// import { Storage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Storage, getDownloadURL, listAll, ref, uploadBytes } from '@angular/fire/storage';

import { getStorage } from '@angular/fire/storage';
// import { ref } from '@angular/fire/database';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private storage: Storage) { }

    uploadFile(fileGroup: File[], email: string): any {

        return fileGroup.map((file: File) => {
            const filePath = `images/${file.name}-${email}`;
            const storageRef = ref(this.storage, filePath);

            uploadBytes(storageRef, file)
                .then(res => {
                    console.log(res);
                })
                .catch(e => {
                    console.log(e);

                })
            return filePath;
        })


    }

    getFiles() {
        const storageRef = ref(this.storage, 'images');

        listAll(storageRef).then(async images => {
            for (let image of images.items) {
                const url = await getDownloadURL(image);
                console.log('img: ', url);

            }
        })
    }

    getFileDownloadUrl(filePath: string) {
        // const fileRef = this.storage.ref(filePath);
        // return fileRef.getDownloadURL();
    }
}
