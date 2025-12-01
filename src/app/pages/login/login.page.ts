  import { Component, inject, ViewChild } from "@angular/core";
  import { CommonModule } from "@angular/common";
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
  import { IonicModule, ToastController } from "@ionic/angular";
  import { Router } from "@angular/router";
  import { LoaderOverlayComponent } from "../../shared/loader-overlay/loader-overlay.component";
  import { LottieComponent } from "ngx-lottie";
  import { AnimationOptions } from "ngx-lottie";
  import { SqliteServices } from "../../services/sqlite-services";

  @Component({
    selector: "app-login",
    templateUrl: "./login.page.html",
    styleUrls: ["./login.page.scss"],
    standalone: true,
    imports: [
      CommonModule,
      IonicModule,
      ReactiveFormsModule,
      LoaderOverlayComponent,
      LottieComponent,
    ],
  })
  export class LoginPage {
    @ViewChild("loader") loader?: LoaderOverlayComponent;

    /**
    --------
    Inyección de dependencias
    --------
    */
    private fb = inject(FormBuilder);
    private authService = inject(SqliteServices);
    private router = inject(Router);
    private toastCtrl = inject(ToastController);

    /**
    --------
    Formulario y validaciones
    --------
    */
    form: FormGroup = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(6), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      password: ["", [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.,;:]).{12,}$/)]],
    });

    /**
    --------
    Animación Lottie
    --------
    */
    lottieOptions: AnimationOptions = {
      path: "/assets/treasure-map.json",
      autoplay: true,
      loop: true,
    };

  /**
  --------
  Autenticación
  --------
  */
  async onSubmit() {
      if (this.form.invalid) {
        return this.showToast("Por favor, rellene todos los campos correctamente.", "danger");
      }

      /** Muestra overlay por 2 segundos */
      this.loader?.showfor(2000);

      const {username, password} = this.form.value;
      const auth = await this.authService.login(username, password);

      if (auth === true) {
        /** Espera fin del loader antes de navegar */
        setTimeout(() => {
          this.showToast("Inicio de sesión exitoso", "success");
          this.router.navigate(["/home"], { replaceUrl: true });
        }, 2000);
      } else {
        await this.showToast(
          typeof auth === 'string' ? auth : 'Usuario o contraseña incorrectos',
          'danger'
        );
      }
    }

      /*
      setTimeout(() => {
        typeof auth === "string" ? auth :
      }, 700);
     */

    // -----------------------------
    //  Navegación
    // -----------------------------
    goToSignup() {
      this.router.navigate(["/signup"], { replaceUrl: true });
    }

    /**
    --------
    Toasts
    --------
    */
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
  }
