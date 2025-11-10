import { Component, inject, NgZone } from '@angular/core';
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
import { personCircle, chevronUp, chevronDown, chatbubbleOutline } from 'ionicons/icons';
import { defineCustomElements } from '@ionic/core/loader';

addIcons({ personCircle, chevronUp, chevronDown, chatbubbleOutline });
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
  // -----------------------------
  //  Inyección y estado inicial
  // -----------------------------
  private router = inject(Router);
  private zone = inject(NgZone);
  items: { id: number; image: string; title: string; content: string; subtitle?: string; date?: string; votes?: number; comments?: { text: string; date: string }[] }[] = [];
  newTitle: string = '';
  newContent: string = '';
  private storageKey = 'caleuche_posts_v1';
  commentsVisible: { [id: number]: boolean } = {};
  commentInput: { [id: number]: string } = {};

  // -----------------------------
  //  Inicialización
  // -----------------------------
  constructor() {
    this.loadPosts();
    if (!this.items || this.items.length === 0) {
      this.generateItems();
      this.savePosts();
    }
  }

  // -----------------------------
  //  Navegación
  // -----------------------------
  goToProfile() {
    this.zone.run(() => {
      this.router.navigateByUrl('/profile').then(() => {
        window.location.reload();
      });
    });
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
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Could not save posts to localStorage', e);
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
    } catch (e) {
      console.warn('Could not load posts from localStorage', e);
      this.items = [];
    }
  }

  // -----------------------------
  //  Interacciones: votos
  // -----------------------------
  vote(postId: number, delta: number) {
    const p = this.items.find(it => it.id === postId);
    if (!p) return;
    p.votes = (p.votes || 0) + delta;
    this.savePosts();
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
  }
}
