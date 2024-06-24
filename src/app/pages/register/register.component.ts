import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';
import { passwordMatchValidator, validateFilesAmount, validateIdentification } from '../../helpers/newUserValidations.helper';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    DialogModule,
    FormsModule,
    ArrowBackComponent,
    ToastModule,
    MultiSelectModule,
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  private _firestore = inject(Firestore);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  public formBuilder = inject(FormBuilder);

  // form props
  public registerForm!: FormGroup;
  public userType: 'patient' | 'specialist';
  public registerLoading = false;

  // specialties
  public allSpecialties = [];
  public visible = false;
  public newSpecialtyName = '';
  public loadingSpecialty = false;


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
      captcha: ['', Validators.required],
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

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }

  handleSelectRegisterType(type: 'patient' | 'specialist'): void {
    console.log(type);
    this.userType = type;
    if (type === 'specialist') {
      this.formControls['healthcare'].clearValidators();
      this.formControls['attachedImage'].setValidators([Validators.required, validateFilesAmount(1, 1)]);
      this.formControls['specialty'].setValidators([Validators.required]);
      // this.formControls['attachedImage'].updateValueAndValidity();
      this.formControls['age'].setValidators([Validators.required, Validators.min(18), Validators.max(100)]);
    }

  }

  handleCancelCreation(): void {
    this.visible = false;
    this.newSpecialtyName = '';
    this.formControls['specialty'].patchValue('');
  }

  handleChangeSpecialty(event: DropdownChangeEvent): void {
    const { value } = event;
    if (value.some((v: string) => v === 'Agregar +')) {
      this.visible = true;
      return;
    }
  }

  handleConfirmCreation(): void {
    const displayName = this.newSpecialtyName.trim();
    if (displayName.length && displayName.length < 20 && !this.allSpecialties.some(s => s.displayName === displayName)) {
      const specialtiesCollection = collection(this._firestore, 'specialties');

      const specialtyFormControlValue = this.formControls['specialty'].value;
      const cleanNewValue = specialtyFormControlValue.filter((s: string) => s !== 'Agregar +');


      this.loadingSpecialty = true;
      addDoc(specialtiesCollection, { displayName })
        .then((data) => {

          this.formControls['specialty'].patchValue([...cleanNewValue, displayName]);
          this.visible = false;
          this.loadingSpecialty = false;
        })
        .catch(() => {
          this.formControls['specialty'].patchValue(cleanNewValue);
          console.log('Ocurrio un error al crear');
          this.loadingSpecialty = false;
        });
    }
  }

  handleAddFile(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    if (file.type.startsWith('image')) {
      const imageControl = this.formControls['attachedImage'];

      imageControl.setValue([...imageControl.value, file]);
      imageControl.updateValueAndValidity();
    }
  }

  handleRemoveImage(item: File): void {
    const imageControl = this.formControls['attachedImage'];
    imageControl.setValue([...imageControl.value.filter((file: File) => file.name !== item.name)])
  }

  submit(): void {
    this.registerLoading = true;

    try {

      if (this.registerForm.valid) {
        this.authService.register(this.registerForm.value, this.userType).then(() => {

          this.toastService.successMessage('Usuario creado con exito');
          setTimeout(() => {
            this.router.navigateByUrl('login');
          }, 3000);

        })
      } else {
        console.log('asd', this.registerForm);

        this.registerForm.markAllAsTouched();
        this.registerLoading = false;
      }
    } catch (e) {
      this.toastService.errorMessage('Ocurrio un error al crear el usuario');
      this.registerLoading = false;
    }

  }

  get formControls() {
    return this.registerForm.controls;
  }

}

