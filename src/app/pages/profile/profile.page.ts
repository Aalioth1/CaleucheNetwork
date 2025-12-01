import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonFooter,
  ToastController,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { SqliteServices, User } from '../../services/sqlite-services';
import { addIcons } from 'ionicons';
import { arrowBack, eye, eyeOff } from 'ionicons/icons';
import {
  Camera,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';

addIcons({ arrowBack, eye, eyeOff });

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonFooter,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonIcon
  ]
})
export class ProfilePage implements OnInit {
  /**
  --------
  Inyección de dependencias
  --------
  */
  private authService = inject(SqliteServices);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  /**
  --------
  Estado local
  --------
  */
  isEditing = false;
  previewImage: string | null = null;
  showPassword = false;
  ages: number[] = Array.from({ length: 108 }, (_, i) => i + 13);
  private readonly STORAGE_KEY = 'profile_image_profile';

  // Datos visibles en la UI
  username: string = '';
  email: string = '';
  password: string = '';
  gender: string = '';
  age: number | null = null;

  /**
  --------
  Ciclo de vida
  --------
  */
  ngOnInit() {
    // Mantener ngOnInit ligero; la carga pesada de datos se hace en ionViewWillEnter
  }

  // Ionic lifecycle: se ejecuta cada vez que la vista va a ser mostrada
  async ionViewWillEnter() {
    try {
      console.debug('profile: ionViewWillEnter start');
      const t0 = performance ? performance.now() : Date.now();
      const user = await this.authService.getCurrentUser();
      const t1 = performance ? performance.now() : Date.now();
      console.debug('profile: getCurrentUser time(ms):', (t1 - t0).toFixed(2));
      if (user) {
        console.debug('profile: user loaded from service', { username: user.username, hasImage: !!user.image });
        this.setUserData(user);
        console.debug('profile: setUserData completed', { username: this.username, previewImageLength: this.previewImage ? this.previewImage.length : 0 });
        if (this.previewImage && this.previewImage.length > 200000) {
          console.warn('profile: previewImage is very large, clearing to avoid rendering issues');
          this.previewImage = null;
        }
      }
    } catch (e) {
      console.warn('profile: ionViewWillEnter failed', e);
    }
  }

  // -----------------------------
  //  Editar y guardar perfil
  // -----------------------------
  async toggleEdit() {
    if (this.isEditing) {
      const updatedUser: User = {
        username: this.username,
        email: this.email,
        password: this.password,
        gender: this.gender,
        age: this.age ?? 0,
        image: this.previewImage
      };
      await this.authService.updateCurrentUser(updatedUser);
      this.showToast('Datos actualizados correctamente', 'success');
      this.showPassword = false;
    }
    this.isEditing = !this.isEditing;
  }

  // -----------------------------
  //  Manejo de imagen de perfil
  // -----------------------------
  onImageSelected(event: Event) {
    if (!this.isEditing) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async openCamera(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isEditing) return;
    
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

      // Guardar en storage
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: base64Image
      });

      await this.showToast('Foto capturada y guardada', 'success');

    } catch (error) {
      console.error('Error en cámara:', error);
      await this.showToast('No se pudo abrir la cámara', 'danger');
    }
  }

  // -----------------------------
  //  Helpers: setear datos del usuario
  // -----------------------------
  private setUserData(user: User) {
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.gender = user.gender;
    this.age = user.age;
    try {
      this.previewImage = user.image || null;
    } catch (e) {
      console.warn('profile: failed to set previewImage', e);
      this.previewImage = null;
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

  goToHome() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

