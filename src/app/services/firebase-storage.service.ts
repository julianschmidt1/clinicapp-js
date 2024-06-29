import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private storage: Storage) { }

    uploadFile(fileGroup: File[], id: string): any {

        return fileGroup.map((file: File) => {
            const filePath = `images/${file.name}-${id}`;
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

    getUserFiles(filePath: string[]) {
        const storage = getStorage();

        const imagePromises = filePath.map((file: string) => {
            if(!file) return null;
            const pathRef = ref(storage, file);
            const imagePath = getDownloadURL(pathRef)

            return imagePath;
        });

        return imagePromises;
    }
}
