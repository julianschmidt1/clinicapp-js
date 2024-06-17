import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";

export function validateIdentification(): ValidatorFn {
  return (control: FormControl): { [key: string]: any } | null => {
    const value = control.value;
    if (isNaN(value) || value < 1000000 || value > 99000000 || value % 1 !== 0) {
      return { dniFormat: true };
    }
    return null;
  };
}

export function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('password').value;
  const confirmPassword = control.get('confirmPassword').value;

  return password === confirmPassword ? null : { passwordMatch: true };
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