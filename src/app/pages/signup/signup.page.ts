import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonNote,
  ToastController,
  IonFooter
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonFooter
  ]
})

export class SignupPage {
  // -----------------------------
  //  Inyección de dependencias
  // -----------------------------
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // -----------------------------
  //  Estado local
  // -----------------------------
  previewImage: string | null = null;

  // -----------------------------
  //  Formulario y validaciones
  // -----------------------------
  form: FormGroup = this.fb.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]
    ],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.,;:]).{12,}$/)
      ]
    ],
    gender: ['', Validators.required],
    age: ['', [Validators.required, Validators.min(13), Validators.max(120)]],
    imageFile: [null]
  });

  async register() {
    // -----------------------------
    //  Registro de usuario
    // -----------------------------
    if (this.form.invalid) {
      await this.showToast('Por favor rellene todos los campos correctamente', 'danger');
      return;
    }

    const user = { ...this.form.value, image: this.previewImage || null };
    const auth = this.authService.register(user as any);

    if (auth === true) {
      await this.showToast('Registro exitoso', 'success');
      this.router.navigate(['/login'], { replaceUrl: true })
    } else if (typeof auth === 'string') {
      await this.showToast(auth, 'danger');
    }
  }

  onImageSelected(event: Event) {
    // -----------------------------
    //  Gestión de imagen de perfil
    // -----------------------------
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ imageFile: file });
      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  // -----------------------------
  //  Utilidades (toasts)
  // -----------------------------
  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message, 
      duration: 2000, 
      color,
      position: 'middle',
      cssClass: 'custom-toast',
      buttons: [
        {
          text: '✕',
          role: 'cancel',
        }
      ]
    });
    await toast.present();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  goToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}

