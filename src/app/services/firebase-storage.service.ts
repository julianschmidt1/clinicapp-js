import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';

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

    // getFiles() {
    //     const storageRef = ref(this.storage, 'images');

    //     listAll(storageRef).then(async images => {
    //         for (let image of images.items) {
    //             const url = await getDownloadURL(image);
    //         }
    //     })
    // }

    // getFileByPath(filePath: string) {
    //     const storage = getStorage();
    //     const pathRef = ref(storage, filePath);

    //     return getStream(pathRef);

    // }

    getUserFiles(filePath: string[]){
        const storage = getStorage();

        const imagePromises = filePath.map((file: string) => {
            const pathRef = ref(storage, file);

            const imagePath = getDownloadURL(pathRef)

            return imagePath;
        });        

        return imagePromises;
    }
}
