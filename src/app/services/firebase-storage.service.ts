import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private storage: Storage) { }

    async uploadFile(fileGroup: File[], id: string): Promise<string[]> {
        const promises: Promise<string>[] = [];
    
        fileGroup.forEach((file: File) => {
            const filePath = `images/${file.name}-${id}`;
            const storageRef = ref(this.storage, filePath);
    
            const uploadTask = uploadBytes(storageRef, file);
    
            const promise = uploadTask.then(async (snapshot) => {
                const downloadUrl = await getDownloadURL(storageRef);
                return downloadUrl;
            });
    
            promises.push(promise);
        });
    
        try {
            return await Promise.all(promises);
        } catch (error) {
            throw error;
        }
    }

    getUserFiles(filePath: string[]) {
        const storage = getStorage();

        const imagePromises = filePath.map((file: string) => {
            if (!file) return null;
            const pathRef = ref(storage, file);
            const imagePath = getDownloadURL(pathRef)

            return imagePath;
        });

        return imagePromises;
    }
}
