import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonSpinner, IonGrid, IonRow, IonCol, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { person, menu, home, logOut } from 'ionicons/icons';

addIcons({ person, menu, home, logOut });

@Component({
  selector: 'app-lore',
  templateUrl: './lore.page.html',
  styleUrls: ['./lore.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSpinner,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
    IonIcon, IonButtons,
    CommonModule, HttpClientModule
  ]
})
export class LorePage implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);

  // UI state
  menuOpen = false;
  loading = true;
  error: string | null = null;

  // List of mythologies/legends to load
  contents: any[] = [];

  // Default topics to load
  private defaultTopics = ['Caleuche', 'Pincoya', 'Trauco', 'La Llorona', 'El Cuco'];

  constructor() { }

  ngOnInit() {
    // Mantener ngOnInit ligero; la carga pesada de datos se hace en ionViewWillEnter
  }

  // Ionic lifecycle: se ejecuta cada vez que la vista va a ser mostrada
  async ionViewWillEnter() {
    console.debug('lore: ionViewWillEnter start');
    await this.loadDefaultContent();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  /**
  --------
  Navegación
  --------
  */
  goToHome() {
    this.router.navigate(['/home'], { replaceUrl: true });
    this.closeMenu();
  }

  goToProfile() {
    console.debug('lore: goToProfile invoked');
    this.router.navigate(['/profile'], { replaceUrl: true }).then(r => console.debug('lore: navigate result', r)).catch(e => console.warn('lore: navigate failed', e));
    this.closeMenu();
  }

  logout() {
    console.debug('lore: logout invoked');
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
    this.closeMenu();
  }

  /**
  --------
  Cargar contenido por defecto
  --------
  */
  private async loadDefaultContent() {
    this.loading = true;
    this.error = null;
    this.contents = [];

    for (const topic of this.defaultTopics) {
      try {
        const encoded = encodeURIComponent(topic.replace(/\s+/g, '_'));
        const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
        const res = await this.http.get<any>(url).toPromise();

        if (res && res.title) {
          this.contents.push(res);
        }
      } catch (e) {
        console.warn(`lore: failed to load ${topic}`, e);
      }
    }

    if (this.contents.length === 0) {
      this.error = 'No se pudo cargar el contenido. Por favor, intenta más tarde.';
    }

    this.loading = false;
  }

  openFull(summary: any) {
    if (summary && summary.content_urls && summary.content_urls.desktop && summary.content_urls.desktop.page) {
      window.open(summary.content_urls.desktop.page, '_blank');
    }
  }

}
