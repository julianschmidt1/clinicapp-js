import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { AbstractControl } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CommonModule,
    ReactiveFormsModule,
    TooltipModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  // form props
  public registerForm!: FormGroup;
  public formBuilder = inject(FormBuilder);
  public isPatient = true;

  // states
  private _authSerivce = inject(AuthService);

  public roleOptions: roleOptionModel[] = [
    { value: 1, label: 'Especialista' },
    { value: 2, label: 'Paciente' },
  ]

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      confirmPassword: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(18), Validators.max(100)]],
      dni: [0, [Validators.required, validateIdentification()]],
      healthcare: ['', Validators.required],
      specialty: ['', Validators.required],
      attachedImage: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
    },
      { validators: passwordMatchValidator });
  }

  handleSelectUserType(event: any): void {
    const { value } = event.value;
    const isPatient = value === 2;
    this.isPatient = isPatient;

    const healthcareControl = this.formControls['healthcare'];
    const specialtyControl = this.formControls['specialty'];
    const attachedImageControl = this.formControls['attachedImage'];

    if (isPatient) {
      healthcareControl.setValidators([Validators.required]);
      specialtyControl.clearValidators();
      attachedImageControl.setValidators([Validators.required, validateFilesAmount(2, 2)]);

    } else {
      specialtyControl.setValidators([Validators.required]);
      healthcareControl.clearValidators();
      attachedImageControl.setValidators([Validators.required, validateFilesAmount(1, 1)]);

    }

    healthcareControl.updateValueAndValidity();
    specialtyControl.updateValueAndValidity();
    attachedImageControl.markAsTouched();

  }

  handleAddFile(event: any): void {
    const file = (event.target as HTMLInputElement).files[0];

    if (file.type.startsWith('image')) {
      const imageControl = this.formControls['attachedImage'];

      imageControl.setValue([...imageControl.value, file]);
    }
  }

  handleRemoveImage(item: File): void {
    const imageControl = this.formControls['attachedImage'];
    imageControl.setValue([...imageControl.value.filter((file: File) => file.name !== item.name)])
  }

  submit(): void {

    if (this.registerForm.valid) {
      this._authSerivce.register(this.registerForm.value);
    } else {
      this.registerForm.markAllAsTouched();
      console.log('NO');

    }

  }

  get formControls() {
    return this.registerForm.controls;
  }

}

interface roleOptionModel {
  value: number,
  label: string,
}

export function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('password').value;
  const confirmPassword = control.get('confirmPassword').value;

  return password === confirmPassword ? null : { passwordMatch: true };
}

export function validateIdentification(): ValidatorFn {
  return (control: FormControl): { [key: string]: any } | null => {
    const value = control.value;
    if (isNaN(value) || value < 1000000 || value > 99000000 || value % 1 !== 0) {
      return { dniFormat: true };
    }
    return null;
  };
}

export function validateFilesAmount(min: number, max: number) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const files: File[] = control.value;

    if (files && (files.length < min || files.length > max)) {
      return { filesLength: true };
    }

    return null;
  };
}
