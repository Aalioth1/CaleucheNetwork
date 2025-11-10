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
import { AuthService, User } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBack, eye, eyeOff } from 'ionicons/icons';

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
  // -----------------------------
  //  Inyección de dependencias
  // -----------------------------
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // -----------------------------
  //  Estado local y flags de UI
  // -----------------------------
  isEditing = false;
  previewImage: string | null = null;
  showPassword = false;

  // Datos visibles en la UI
  username: string = '';
  email: string = '';
  password: string = '';
  gender: string = '';
  age: number | null = null;

  // -----------------------------
  //  Ciclo de vida
  // -----------------------------
  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.setUserData(user);
    }
  }

  // -----------------------------
  //  Editar y guardar perfil
  // -----------------------------
  toggleEdit() {
    if (this.isEditing) {
      const updatedUser: User = {
        username: this.username,
        email: this.email,
        password: this.password,
        gender: this.gender,
        age: this.age ?? 0,
        image: this.previewImage
      };
      this.authService.updateCurrentUser(updatedUser);
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

  // -----------------------------
  //  Helpers: setear datos del usuario
  // -----------------------------
  private setUserData(user: User) {
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.gender = user.gender;
    this.age = user.age;
    this.previewImage = user.image || null;
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

