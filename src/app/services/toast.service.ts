import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService: MessageService) { }

  errorMessage(detail: string = 'Error', title: string = 'Oops', expiration: number = 4000) {
    this.messageService.add({ severity: 'error', summary: title, detail: detail, life: expiration })
  }

  successMessage(detail: string = 'Ok', title: string = 'Éxito', expiration: number = 4000) {
    this.messageService.add({ severity: 'success', summary: title, detail: detail, life: expiration })
  }

  warningMessage(detail: string = 'Warning', title: string = 'Oops', expiration: number = 4000) {
    this.messageService.add({ severity: 'warn', summary: title, detail: detail, life: expiration })
  }
}