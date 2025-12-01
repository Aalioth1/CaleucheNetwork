import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export interface User {
  username: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  image?: string | null;
}

/**
 * SqliteServices
 */
@Injectable({
  providedIn: 'root',
})
export class SqliteServices {
  private users: User[] = [];
  private currentUser: User | null = null;

  // Plugin
  private SQLiteConnection?: any;
  private CapacitorSQLite?: any;
  private db?: any;
  private dbName = 'caleuche_db';
  private initialized = false;

  constructor() {
    this.init();
  }

  // -----------------------------
  // Initialization
  // -----------------------------
  private async init() {
    try {
      /** Importación dinámica del plugin */
      const mod = await import('@capacitor-community/sqlite');
      /** Compatibilidad con distintas versiones del plugin */
      this.CapacitorSQLite = (mod as any).CapacitorSQLite || (mod as any).SQLite || (mod as any).default || mod;
    } catch (err) {
      /** Plugin no disponible */
      this.CapacitorSQLite = undefined;
    }

    /** Intenta abrir BD si el plugin está disponible en plataforma nativa */
    if (this.CapacitorSQLite && Capacitor.getPlatform() !== 'web') {
      try {
        await this.openConnection();
        await this.createTables();
        /** Avoid heavy initial load of all users on init — load on demand to improve startup performance */
        this.initialized = true;
      } catch (e) {
        console.warn('SQLite init failed, falling back to LocalStorage', e);
        this.loadFromLocalStorage();
      }
    } else {
      /** Fallback a LocalStorage */
      this.loadFromLocalStorage();
    }
  }

  private async openConnection() {
    const dbName = this.dbName;

    /** Intenta compatibilidad con múltiples APIs */
    try {
      if (this.CapacitorSQLite && typeof this.CapacitorSQLite.createConnection === 'function') {
        const conn = await this.CapacitorSQLite.createConnection({ database: dbName, version: 1, encrypted: false, mode: 'no-encryption' });
        if (conn && typeof conn.open === 'function') {
          await conn.open();
          this.db = conn;
          return;
        }
      }

      if (this.CapacitorSQLite && typeof this.CapacitorSQLite.open === 'function') {
        this.db = await this.CapacitorSQLite.open({ database: dbName });
        return;
      }

      /** Algunos builds exponen execute/run directamente */
      if (this.CapacitorSQLite && (typeof this.CapacitorSQLite.execute === 'function' || typeof this.CapacitorSQLite.run === 'function')) {
        this.db = this.CapacitorSQLite;
        return;
      }

      /** Fallback Cordova si está presente */
      if ((window as any).sqlitePlugin && typeof (window as any).sqlitePlugin.openDatabase === 'function') {
        this.db = (window as any).sqlitePlugin.openDatabase({ name: dbName, location: 'default' });
        return;
      }

      throw new Error('No compatible SQLite API found');
    } catch (e) {
      throw e;
    }
  }

  private async createTables() {
    /** Crea tablas de usuarios y meta */
    const createUsers = `CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      gender TEXT,
      age INTEGER,
      image TEXT
    );`;

    const createMeta = `CREATE TABLE IF NOT EXISTS meta (
      k TEXT PRIMARY KEY,
      v TEXT
    );`;

    await this.executeSql(createUsers);
    await this.executeSql(createMeta);
  }

  /** Ejecutor genérico  */
  private async executeSql(statement: string, values: any[] = []) {
    /** Verifica disponibilidad de BD */
    if (!this.db) throw new Error('Database not opened');

    /** Intenta execute o run */
    try {
      if (typeof this.db.execute === 'function') {
        /** Algunos APIs esperan objeto o args */
        try {
          return await this.db.execute({ statements: statement, values });
        } catch (_) {
          return await this.db.execute(statement, values);
        }
      }

      if (typeof this.db.run === 'function') {
        try {
          return await this.db.run(statement, values);
        } catch (_) {
          /** Alternativa con objeto */
          return await this.db.run({ statement, values });
        }
      }

      /** Intenta métodos a nivel superior del plugin */
      if (this.CapacitorSQLite) {
        if (typeof this.CapacitorSQLite.execute === 'function') {
          return await this.CapacitorSQLite.execute({ statement, values });
        }
        if (typeof this.CapacitorSQLite.run === 'function') {
          return await this.CapacitorSQLite.run({ statement, values });
        }
      }

      /** Fallback para Cordova sqlitePlugin */
      if ((this.db as any).transaction && typeof (this.db as any).transaction === 'function') {
        return new Promise((resolve, reject) => {
          (this.db as any).transaction((tx: any) => {
            tx.executeSql(statement, values, (_tx: any, res: any) => resolve(res), (_tx: any, err: any) => reject(err));
          });
        });
      }

      throw new Error('No SQL execution method found on DB object');
    } catch (err) {
      /** Propaga error para fallback */
      throw err;
    }
  }

  /**
  --------
  API Pública (async)
  --------
  */
  async register(user: User): Promise<string | boolean> {
    /** Validaciones del usuario */
    if (!this.isValidUsername(user.username)) return 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.';
    if (!this.isValidPassword(user.password)) return 'La contraseña debe tener al menos 12 caracteres, al menos 1 mayúscula, al menos 1 número y al menos un carácter especial.';
    if (!this.isValidEmail(user.email)) return 'Ingrese un formato de correo electrónico válido.';
    if (user.age < 13) return 'Debes tener al menos 13 años para registrarte.';
    if (!['masculino', 'femenino', 'otro'].includes(user.gender.toLowerCase())) return 'El género debe ser masculino, femenino u otro.';

    try {
      if (!this.db) throw new Error('DB not available');

      /** Verifica si usuario ya existe */
      const q = 'SELECT username, email FROM users WHERE username = ? OR email = ? LIMIT 1;';
      const res: any = await this.executeSql(q, [user.username, user.email]);

      /** Detecta formato de respuesta según plugin */
      let rowsLen = 0;
      if (res && typeof res.rows === 'object') rowsLen = res.rows.length || res.rows.item ? res.rows.length : 0;
      if (Array.isArray(res)) rowsLen = res.length;

      if (rowsLen && rowsLen > 0) return 'El nombre de usuario o correo ya están registrados.';

      const insert = 'INSERT INTO users (username, email, password, gender, age, image) VALUES (?, ?, ?, ?, ?, ?);';
      await this.executeSql(insert, [user.username, user.email, user.password, user.gender, user.age, user.image || null]);

      /** Asigna usuario actual en meta */
      await this.setMeta('currentUser', JSON.stringify({ username: user.username }));

      /** Recarga lista en memoria */
      await this.loadFromDB();
      return true;
    } catch (err) {
      /** Fallback a LocalStorage si BD no disponible */
      console.warn('register: falling back to LocalStorage', err);
      this.users.push(user);
      this.currentUser = user;
      this.saveToLocalStorage();
      return true;
    }
  }

  async login(usernameOrEmail: string, password: string): Promise<string | boolean> {
    try {
      if (!this.db) throw new Error('DB not available');

      const q = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? LIMIT 1;';
      const res: any = await this.executeSql(q, [usernameOrEmail, usernameOrEmail, password]);

      /** Lee resultado según formato del plugin */
      let userRow: any = null;
      if (res && res.rows && typeof res.rows.item === 'function' && res.rows.length > 0) {
        userRow = res.rows.item(0);
      } else if (Array.isArray(res) && res.length > 0) {
        userRow = res[0];
      } else if ((res as any).values && (res as any).values.length > 0) {
        userRow = (res as any).values[0];
      }

      if (!userRow) return 'Usuario o contraseña incorrectos.';

      const user: User = {
        username: userRow.username,
        email: userRow.email,
        password: userRow.password,
        gender: userRow.gender,
        age: userRow.age,
        image: userRow.image
      };

      await this.setMeta('currentUser', JSON.stringify({ username: user.username }));
      this.currentUser = user;
      /** Recarga lista de usuarios en memoria */
      await this.loadFromDB();
      return true;
    } catch (err) {
      /** Fallback a LocalStorage */
      console.warn('login: falling back to LocalStorage', err);
      const user = this.users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
      if (!user) return 'Usuario o contraseña incorrectos.';
      this.currentUser = user;
      this.saveToLocalStorage();
      return true;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.db) await this.deleteMeta('currentUser');
    } catch (e) {
      // ignore
    }
    this.currentUser = null;
    this.saveToLocalStorage();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.debug('getCurrentUser start');
      const t0 = performance ? performance.now() : Date.now();
      if (this.db) {
        /** Carga usuario actual desde BD */
        const meta = await this.getMeta('currentUser');
        if (meta) {
          const parsed = JSON.parse(meta);
          const username = parsed.username;
          const res: any = await this.executeSql('SELECT * FROM users WHERE username = ? LIMIT 1;', [username]);
          let userRow: any = null;
          if (res && res.rows && typeof res.rows.item === 'function' && res.rows.length > 0) userRow = res.rows.item(0);
          if (userRow) {
            this.currentUser = {
              username: userRow.username,
              email: userRow.email,
              password: userRow.password,
              gender: userRow.gender,
              age: userRow.age,
              image: userRow.image
            };
            const t1 = performance ? performance.now() : Date.now();
            console.debug('getCurrentUser db-read time(ms):', (t1 - t0).toFixed(2));
            return this.currentUser;
          }
        }
      }
    } catch (e) {
      console.warn('getCurrentUser DB read failed', e);
    }

    /** Fallback a memoria o LocalStorage */
    this.loadFromLocalStorage();
    return this.currentUser;
  }

  async updateCurrentUser(updated: User): Promise<boolean> {
    try {
      if (!this.currentUser) return false;

      // Si no hay conexión a la BD (modo web/fallback), actualizar directamente LocalStorage
      if (!this.db) {
        // Actualiza lista en memoria si existe
        const idx = this.users.findIndex(u => u.username === this.currentUser!.username);
        if (idx !== -1) {
          this.users[idx] = { ...updated };
        } else {
          this.users.push({ ...updated });
        }
        this.currentUser = { ...updated };
        // Actualiza currentUser y users en LocalStorage sin lanzar excepción
        this.saveToLocalStorage();
        return true;
      }

      const q = 'UPDATE users SET username = ?, email = ?, password = ?, gender = ?, age = ?, image = ? WHERE username = ?;';
      await this.executeSql(q, [updated.username, updated.email, updated.password, updated.gender, updated.age, updated.image || null, this.currentUser.username]);
      await this.setMeta('currentUser', JSON.stringify({ username: updated.username }));
      await this.loadFromDB();
      return true;
    } catch (err) {
      /** Fallback a LocalStorage en caso de error en la ejecución SQL */
      console.warn('updateCurrentUser: SQL error, falling back to LocalStorage', err);
      if (!this.currentUser) return false;
      const idx = this.users.findIndex(u => u.username === this.currentUser!.username);
      if (idx === -1) return false;
      this.users[idx] = { ...updated };
      this.currentUser = { ...updated };
      this.saveToLocalStorage();
      return true;
    }
  }

  /**
  --------
  Helpers Meta
  --------
  */
  private async setMeta(k: string, v: string) {
    try {
      const q = 'REPLACE INTO meta (k, v) VALUES (?, ?);';
      /** Inserta o reemplaza registro meta */
      await this.executeSql(q, [k, v]);
    } catch (e) {
      throw e;
    }
  }

  /** Lee valor de tabla meta */
  private async getMeta(k: string): Promise<string | null> {
    try {
      const res: any = await this.executeSql('SELECT v FROM meta WHERE k = ? LIMIT 1;', [k]);
      if (res && res.rows && typeof res.rows.item === 'function' && res.rows.length > 0) return res.rows.item(0).v;
      if (Array.isArray(res) && res.length > 0) return res[0].v;
      if ((res as any).values && (res as any).values.length > 0) return (res as any).values[0].v;
      return null;
    } catch (e) {
      return null;
    }
  }

  private async deleteMeta(k: string) {
    try {
      await this.executeSql('DELETE FROM meta WHERE k = ?;', [k]);
    } catch (e) {
      /** Sin acción */
    }
  }

  /**
  --------
  Persistencia LocalStorage
  --------
  */
  /** Guarda usuarios en LocalStorage */
  private saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  /** Carga usuarios desde LocalStorage */
  private loadFromLocalStorage() {
    const storedUsers = localStorage.getItem('users');
    const storedCurrentUser = localStorage.getItem('currentUser');
    if (storedUsers) this.users = JSON.parse(storedUsers);
    if (storedCurrentUser) this.currentUser = JSON.parse(storedCurrentUser);
  }

  /** Carga todos los usuarios desde BD a memoria */
  private async loadFromDB() {
    try {
      if (!this.db) throw new Error('DB not opened');
      const res: any = await this.executeSql('SELECT * FROM users;');
      const list: User[] = [];
      if (res && res.rows && typeof res.rows.item === 'function') {
        for (let i = 0; i < res.rows.length; i++) {
          const r = res.rows.item(i);
          list.push({ username: r.username, email: r.email, password: r.password, gender: r.gender, age: r.age, image: r.image });
        }
      } else if (Array.isArray(res)) {
        for (const r of res) list.push({ username: r.username, email: r.email, password: r.password, gender: r.gender, age: r.age, image: r.image });
      } else if ((res as any).values) {
        for (const r of (res as any).values) list.push({ username: r.username, email: r.email, password: r.password, gender: r.gender, age: r.age, image: r.image });
      }

      this.users = list;
      /** Carga usuario actual desde meta */
      const meta = await this.getMeta('currentUser');
      if (meta) {
        const parsed = JSON.parse(meta);
        const u = this.users.find(x => x.username === parsed.username) || null;
        this.currentUser = u;
      }
    } catch (err) {
      console.warn('loadFromDB failed, fallback to LocalStorage', err);
      this.loadFromLocalStorage();
    }
  }

  /**
  --------
  Migración de datos
  --------
  */
  /** Migra usuarios de LocalStorage a SQLite (mejor intento) */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const storedUsers = localStorage.getItem('users');
      const storedCurrentUser = localStorage.getItem('currentUser');
      if (!storedUsers) return;
      const users: User[] = JSON.parse(storedUsers);
      for (const u of users) {
        try {
          await this.executeSql('INSERT OR IGNORE INTO users (username, email, password, gender, age, image) VALUES (?, ?, ?, ?, ?, ?);', [u.username, u.email, u.password, u.gender, u.age, u.image || null]);
        } catch (e) {
          /** Ignora duplicados y errores por usuario */
        }
      }
      if (storedCurrentUser) {
        try {
          const curr = JSON.parse(storedCurrentUser);
          if (curr && curr.username) await this.setMeta('currentUser', JSON.stringify({ username: curr.username }));
        } catch (e) {
          /** Sin acción */
        }
      }
      /** Recarga los datos */
      await this.loadFromDB();
    } catch (e) {
      console.warn('migration failed', e);
    }
  }


  /** Valida formato del nombre de usuario */
  private isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(username);
  }

  /** Valida fortaleza de la contraseña */
  private isValidPassword(password: string): boolean {
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  /** Valida formato del correo */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
