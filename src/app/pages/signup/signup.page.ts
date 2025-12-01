import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqliteServices } from '../../services/sqlite-services';
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

import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';

import { Preferences } from '@capacitor/preferences';

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
    IonFooter,
  ]
})
export class SignupPage {

  private fb = inject(FormBuilder);
  private authService = inject(SqliteServices);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  previewImage: string | null = null;
  ages: number[] = Array.from({ length: 108 }, (_, i) => i + 13);
  
  private readonly STORAGE_KEY = 'profile_image_signup';

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

  async ionViewWillEnter() {
    await this.loadSavedProfileImage();
  }

  async loadSavedProfileImage() {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEY });
      if (result.value) {
        this.previewImage = result.value;
      }
    } catch (error) {
      console.error('Error loading saved image:', error);
    }
  }

  async register() {
    if (this.form.invalid) {
      await this.showToast('Por favor rellene todos los campos correctamente', 'danger');
      return;
    }

    const user = { ...this.form.value, image: this.previewImage || null };
    const auth = await this.authService.register(user as any);

    if (auth === true) {
      await this.showToast('Registro exitoso', 'success');
      this.router.navigate(['/login'], { replaceUrl: true });
    } else if (typeof auth === 'string') {
      await this.showToast(auth, 'danger');
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ imageFile: file });
      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async openCamera(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 600,
        height: 600
      });

      const base64Image = `data:image/jpeg;base64,${image.base64String}`;

      this.previewImage = base64Image;
      this.form.patchValue({ imageFile: base64Image });

      // Guardar en storage
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: base64Image
      });

      await this.showToast('Foto capturada y guardada', 'success');

    } catch (error) {
      await this.showToast('No se pudo abrir la cámara', 'danger');
      console.error(error);
    }
  }

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
