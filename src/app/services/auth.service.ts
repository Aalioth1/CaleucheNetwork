import { Injectable } from '@angular/core';

export interface User {
  username: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  image?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadFromLocalStorage();
  }

  // -----------------------------
  //  Registro con validaciones
  // -----------------------------
  register(user: User): string | boolean {
    if (!this.isValidUsername(user.username)) return 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.';
    if (!this.isValidPassword(user.password)) return 'La contraseña debe tener al menos 12 caracteres, al menos 1 mayúscula, al menos 1 número y al menos un carácter especial.';
    if (!this.isValidEmail(user.email)) return 'Ingrese un formato de correo electrónico válido.';
    if (user.age < 13) return 'Debes tener al menos 13 años para registrarte.';
    if (!['masculino', 'femenino', 'otro'].includes(user.gender.toLowerCase())) return 'El género debe ser masculino, femenino u otro.';

    const exists = this.users.some(u => u.username === user.username || u.email === user.email);
    if (exists) return 'El nombre de usuario o correo ya están registrados.';

    this.users.push(user);
    this.currentUser = user;
    this.saveToLocalStorage();
    return true;
  }

  // -----------------------------
  //  Inicio de sesión
  // -----------------------------
  login(usernameOrEmail: string, password: string): string | boolean {
    const user = this.users.find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );

    if (!user) return 'Usuario o contraseña incorrectos.';

    this.currentUser = user;
    this.saveToLocalStorage();
    return true;
  }

  // -----------------------------
  //  Cierre de sesión
  // -----------------------------
  logout() {
    this.currentUser = null;
    this.saveToLocalStorage();
  }

  // -----------------------------
  //  Obtener usuario actual
  // -----------------------------
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // -----------------------------
  //  Actualizar perfil
  // -----------------------------
  updateCurrentUser(updated: User): boolean {
    if (!this.currentUser) return false;

    const index = this.users.findIndex(u => u.username === this.currentUser!.username);
    if (index === -1) return false;

    this.users[index] = { ...updated };
    this.currentUser = { ...updated };
    this.saveToLocalStorage();
    return true;
  }

  // -----------------------------
  //  Validaciones
  // -----------------------------
  private isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(username);
  }

  private isValidPassword(password: string): boolean {
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // -----------------------------
  // -----------------------------
  //  Persistencia en LocalStorage
  // -----------------------------
  private saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  private loadFromLocalStorage() {
    const storedUsers = localStorage.getItem('users');
    const storedCurrentUser = localStorage.getItem('currentUser');
    if (storedUsers) this.users = JSON.parse(storedUsers);
    if (storedCurrentUser) this.currentUser = JSON.parse(storedCurrentUser);
  }
}

