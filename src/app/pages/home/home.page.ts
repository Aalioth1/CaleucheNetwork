import { Component, inject, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton, IonButtons, IonContent, IonFooter, IonHeader,
  IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
  IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonAvatar,
  IonInput, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { person, chevronUp, chevronDown, chatbubbleOutline, arrowDown, menu, logOut, home } from 'ionicons/icons';
import { defineCustomElements } from '@ionic/core/loader';

addIcons({ person, chevronUp, chevronDown, chatbubbleOutline, arrowDown, menu, logOut, home });
defineCustomElements();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonFooter, IonList, IonItem, IonLabel,
    IonInfiniteScroll, IonInfiniteScrollContent, IonAvatar,
    IonInput, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    FormsModule,
    DatePipe
  ],
})
export class HomePage {
  /**
  --------
  Inyección de dependencias
  --------
  */
  private router = inject(Router);
  private zone = inject(NgZone);
  @ViewChild('feedSection', { read: ElementRef }) feedSection!: ElementRef;
  menuOpen = false;
  items: { id: number; image: string; title: string; content: string; subtitle?: string; date?: string; votes?: number; userVotes?: { [userId: string]: number }; comments?: { text: string; date: string }[] }[] = [];
  newTitle: string = '';
  newContent: string = '';
  private storageKey = 'caleuche_posts_v1';
  private userIdKey = 'caleuche_user_id';
  private userId: string = '';
  commentsVisible: { [id: number]: boolean } = {};
  commentInput: { [id: number]: string } = {};

  /**
  --------
  Inicialización
  --------
  */
  constructor() {
    this.userId = this.getUserId();
    this.loadPosts();
    if (!this.items || this.items.length === 0) {
      this.generateItems();
      this.savePosts();
    }
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
    // Navegar al perfil sin recargar toda la aplicación
    console.debug('home: goToProfile invoked');
    this.router.navigate(['/profile'], { replaceUrl: true }).then(r => console.debug('home: navigate result', r)).catch(e => console.warn('home: navigate failed', e));
    this.closeMenu();
  }

  openFirstPost() {
    if (this.items && this.items.length > 0) {
      const id = this.items[0].id;
      if (typeof id === 'number') this.toggleComments(id);
    }
    this.closeMenu();
  }

  goToLore() {
    this.router.navigate(['/lore'], { replaceUrl: true }).then(() => this.closeMenu()).catch(e => { console.warn('home: goToLore failed', e); this.closeMenu(); });
  }

  logout() {
    console.debug('home: logout invoked');
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
    this.closeMenu();
  }

  /** Desplazar hacia la sección de publicaciones */
  scrollToFeed() {
    try {
      // Intentar desplazar al primer post para que quede en la parte superior
      if (this.feedSection) {
        const firstPost = this.feedSection.nativeElement.querySelector('.post-item');
        if (firstPost) {
          firstPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        // Fallback: desplazar la propia sección
        this.feedSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      // degrade silently
      if (this.feedSection) this.feedSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // -----------------------------
  //  Generador de posts de ejemplo
  // -----------------------------
  generateItems(count: number = 20) {
    const start = this.items.length + 1;
    for (let i = start; i < start + count; i++) {
      this.items.push({
        id: i,
        image: `https://picsum.photos/80/80?random=${i}`,
        title: `Publicación ${i}`,
        content: 'Contenido misterioso emergiendo del océano digital 🌊',
        date: new Date().toISOString(),
        votes: 0,
        userVotes: {},
        comments: []
      });
    }
  }

  // -----------------------------
  //  Carga infinita
  // -----------------------------
  loadData(event: any) {
    setTimeout(() => {
      this.generateItems(10);
      this.savePosts();
      event.target.complete();
    }, 800);
  }

  // -----------------------------
  //  Publicar nuevo post
  // -----------------------------
  publish() {
    const title = this.newTitle?.trim();
    const content = this.newContent?.trim();
    if (!title || !content) return;

    const id = (this.items.length ? Math.max(...this.items.map(p => p.id || 0)) : 0) + 1;
    const post = {
      id,
      image: `https://picsum.photos/80/80?random=${id}`,
      title,
      content,
      date: new Date().toISOString(),
      votes: 0,
      userVotes: {},
      comments: []
    };

    this.zone.run(() => {
      this.items.unshift(post);
      this.savePosts();
    });
    this.newTitle = '';
    this.newContent = '';
  }

  // -----------------------------
  //  Persistencia (localStorage)
  // -----------------------------
  savePosts() {
    try {
      this.sortPosts();
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Could not save posts to localStorage', e);
    }
  }

  /** Ordena posts por relevancia calculada (votos e inmediatez)
   *  Mayor score => más arriba
   */
  private sortPosts() {
    try {
      const now = Date.now();
      this.items.sort((a, b) => {
        const votesA = a.votes || 0;
        const votesB = b.votes || 0;
        const ageA = (now - (a.date ? Date.parse(a.date) : now)) / 1000; // seconds
        const ageB = (now - (b.date ? Date.parse(b.date) : now)) / 1000;
        const scoreA = votesA * 1000000 - ageA;
        const scoreB = votesB * 1000000 - ageB;
        return scoreB - scoreA;
      });
    } catch (e) {
      // if something fails, keep original order
      console.warn('sortPosts failed', e);
    }
  }

  // -----------------------------
  //  Cargar posts desde localStorage
  // -----------------------------
  loadPosts() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.items = JSON.parse(raw);
      else this.items = [];
      // Ordenar por relevancia al cargar
      this.sortPosts();
    } catch (e) {
      console.warn('Could not load posts from localStorage', e);
      this.items = [];
    }
  }

  // -----------------------------
  //  Identificación única del usuario
  // -----------------------------
  private getUserId(): string {
    let id = localStorage.getItem(this.userIdKey);
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.userIdKey, id);
    }
    return id;
  }

  // -----------------------------
  //  Interacciones: votos
  // -----------------------------
  vote(postId: number, delta: number) {
    const p = this.items.find(it => it.id === postId);
    if (!p) return;

    /** Inicializar objeto de votos si no existe */
    if (!p.userVotes) {
      p.userVotes = {};
    }

    /** Obtener voto actual del usuario para este post */
    const currentVote = p.userVotes[this.userId] || 0;

    /** Si el usuario intenta votar con el mismo valor, cancela el voto */
    if (currentVote === delta) {
      p.votes = (p.votes || 0) - delta;
      delete p.userVotes[this.userId];
    } else {
      /** Si el usuario cambió de voto, resta el anterior y suma el nuevo */
      if (currentVote !== 0) {
        p.votes = (p.votes || 0) - currentVote;
      }
      /** Registra el nuevo voto */
      p.votes = (p.votes || 0) + delta;
      p.userVotes[this.userId] = delta;
    }

    this.savePosts();
    // Re-sort feed after interaction to reflect new relevance
    this.sortPosts();
  }

  // -----------------------------
  //  Obtener voto del usuario para un post
  // -----------------------------
  getUserVote(postId: number): number {
    const p = this.items.find(it => it.id === postId);
    if (!p || !p.userVotes) return 0;
    return p.userVotes[this.userId] || 0;
  }

  // -----------------------------
  //  Mostrar/ocultar comentarios
  // -----------------------------
  toggleComments(postId: number) {
    this.commentsVisible[postId] = !this.commentsVisible[postId];
  }

  // -----------------------------
  //  Añadir comentario
  // -----------------------------
  addComment(postId: number) {
    const text = (this.commentInput[postId] || '').trim();
    if (!text) return;
    const p = this.items.find(it => it.id === postId);
    if (!p) return;
    p.comments = p.comments || [];
    p.comments.push({ text, date: new Date().toISOString() });
    this.commentInput[postId] = '';
    this.savePosts();
    // Re-sort feed after comment activity
    this.sortPosts();
  }
}
