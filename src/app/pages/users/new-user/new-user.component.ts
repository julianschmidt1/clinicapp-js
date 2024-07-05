import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { passwordMatchValidator, validateFilesAmount, validateIdentification } from '../../../helpers/newUserValidations.helper';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../../services/toast.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { StorageService } from '../../../services/firebase-storage.service';


@Component({
  selector: 'new-user',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    DropdownModule,
    InputTextModule,
    ToastModule,
    MultiSelectModule,
    FormsModule
  ],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.scss'
})
export class NewUserComponent implements OnInit {

  @Output() onOpen = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();
  @Input() visible = true;

  private formBuilder = inject(FormBuilder);
  private _firestore = inject(Firestore);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);

  public userType: 'patient' | 'specialist' | 'admin';
  public registerForm: FormGroup;
  public registerLoading = false;

  public allSpecialties = [];
  public newSpecialtyName = '';

  public loadingSpecialty = false;
  public newSpecialtyImage: File = null;
  public addSpecialtyVisible = false;

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      // type: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      confirmPassword: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      dni: ['', [Validators.required, validateIdentification()]],
      healthcare: ['', Validators.required],
      specialty: [null],
      attachedImage: ['', [Validators.required, validateFilesAmount(2, 2)]],
    },
      { validators: passwordMatchValidator }
    );

    const specialtiesCollection = collection(this._firestore, 'specialties');

    collectionData(specialtiesCollection).subscribe({
      next: (data) => {
        this.allSpecialties = [{ displayName: 'Agregar +' }, ...data];
      },
      error: (error) => {

        this.allSpecialties = [];
      }
    });
  }

  get formControls() {
    return this.registerForm.controls;
  }

  submit(): void {
    this.registerLoading = true;

    try {

      if (this.registerForm.valid) {
        this.authService.register(this.registerForm.value, this.userType, false)
          .then(() => {

            this.handleCancel();
            this.registerLoading = false;
            // this.visible = false;
            this.toastService.successMessage('Usuario creado con exito');
          })
      } else {

        this.registerForm.markAllAsTouched();
        this.registerLoading = false;
      }
    } catch (e) {
      this.toastService.errorMessage('Ocurrio un error al crear el usuario');
      this.registerLoading = false;
    }
  }

  handleSelectRegisterType(type: 'patient' | 'specialist' | 'admin'): void {
    this.userType = type;

    if (type === 'specialist') {
      this.formControls['healthcare'].clearValidators();
      this.formControls['attachedImage'].setValidators([Validators.required, validateFilesAmount(1, 1)]);
      this.formControls['specialty'].setValidators([Validators.required]);
      // this.formControls['attachedImage'].updateValueAndValidity();
      this.formControls['age'].setValidators([Validators.required, Validators.min(18), Validators.max(100)]);
    }

    if (type === 'admin') {
      this.formControls['attachedImage'].setValidators([Validators.required, validateFilesAmount(1, 1)]);
      this.formControls['age'].setValidators([Validators.required, Validators.min(18), Validators.max(100)]);
      this.formControls['healthcare'].clearValidators();
      this.formControls['specialty'].clearValidators();
    }

  }

  handleAddFile(event: any): void {

    const file = (event.target as HTMLInputElement).files[0];

    if (file.type.startsWith('image')) {
      const imageControl = this.formControls['attachedImage'];

      if (imageControl.value && imageControl.value.length) {
        imageControl.setValue([...imageControl.value, file]);
      } else {
        imageControl.setValue([file]);
      }

      imageControl.updateValueAndValidity();
    }
  }

  handleRemoveImage(item: File): void {
    const imageControl = this.formControls['attachedImage'];
    imageControl.setValue([...imageControl.value.filter((file: File) => file.name !== item.name)])
  }

  handleCancelCreation(): void {
    this.addSpecialtyVisible = false;
    this.newSpecialtyName = '';
    this.formControls['specialty'].patchValue('');
  }

  handleConfirmCreation(): void {
    const displayName = this.newSpecialtyName.trim();
    if (displayName.length && displayName.length < 20 && !this.allSpecialties.some(s => s.displayName === displayName)) {
      const specialtiesCollection = collection(this._firestore, 'specialties');

      const specialtyFormControlValue = this.formControls['specialty'].value;
      const cleanNewValue = specialtyFormControlValue.filter((s: string) => s !== 'Agregar +');

      this.storageService.uploadFile([this.newSpecialtyImage], displayName)
        .then((attachedFilePath: string[]) => {

          this.loadingSpecialty = true;
          addDoc(specialtiesCollection, { displayName, attachedFilePath })
            .then((data) => {

              this.formControls['specialty'].patchValue([...cleanNewValue, displayName]);
              this.addSpecialtyVisible = false;
              this.loadingSpecialty = false;
            })
            .catch(() => {
              this.formControls['specialty'].patchValue(cleanNewValue);
              this.loadingSpecialty = false;
            });
        })
    }
  }

  handleAddSpecialtyImage(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];
    if (!file.type.startsWith('image')) {
      this.toastService.errorMessage('El archivo no es una imagen valida');
      return;
    }

    this.newSpecialtyImage = file;
  }

  handleChangeSpecialty(event: DropdownChangeEvent): void {

    const { value } = event;
    if (value.some((v: string) => v === 'Agregar +')) {
      this.addSpecialtyVisible = true;
      return;
    }
  }

  handleCancel(): void {
    this.onCancel.emit(false);
    this.visible = false;
    this.registerForm.reset();
    this.userType = undefined;
  }

}
