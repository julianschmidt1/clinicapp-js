import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    DropdownModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  // form
  public entityForm!: FormGroup;
  public formBuilder = inject(FormBuilder);
  // states
  private _authSerivce = inject(AuthService);

  public roleOptions = [
    { value: 1, label: 'Especialista' },
    { value: 2, label: 'Paciente' },
  ]

  ngOnInit() {
    this.entityForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      type: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(18), Validators.max(100)]],
      dni: [0, [Validators.required, Validators.min(1)]],

    });
  }

}
