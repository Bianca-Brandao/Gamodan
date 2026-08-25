import { Injectable, computed, signal } from '@angular/core';

export type AuthMode = 'entrar' | 'criar';

export interface AuthUser {
  nome: string;
  email: string;
  admin: boolean;
  foto?: string;
}

export interface AuthCredentials {
  nome?: string;
  email: string;
  senha: string;
  foto?: string;
}

interface StoredUser {
  nome: string;
  email: string;
  senha: string;
  foto?: string;
}

const SESSION_KEY = 'gamodan-auth-user';
const LEGACY_SESSION_KEY = 'gamodan-auth';
const USERS_KEY = 'gamodan-users';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MEMBER_EMAILS = [
  'analuiza.rochacoelho09@gmail.com',
  'bianca.brandao.bbs@gmail.com',
  'estelanunes889@gmail.com',
  'kethyncris123@gmail.com',
  'liviamendonca123456@gmail.com',
  'martinsmarcelli06@gmail.com',
  'mariaeduarda19@gmail.com',
  'maryannemqs@gmail.com',
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionState = signal<AuthUser | null>(this.loadUser());
  private readonly modalState = signal(false);
  private readonly modeState = signal<AuthMode>('entrar');

  readonly usuario = this.sessionState.asReadonly();
  readonly modalAberto = this.modalState.asReadonly();
  readonly modo = this.modeState.asReadonly();
  readonly autenticado = computed(() => this.usuario() !== null);
  readonly isLogado = this.autenticado;
  readonly admin = computed(() => this.usuario()?.admin ?? false);

  abrirModal(modo: AuthMode = 'entrar'): void {
    this.modeState.set(modo);
    this.modalState.set(true);
  }

  fecharModal(): void {
    this.modalState.set(false);
  }

  login(credentials: AuthCredentials): boolean {
    const email = credentials.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || !credentials.senha) return false;

    const record = this.loadUsers().find((user) => user.email === email);
    if (!record || record.senha !== credentials.senha) return false;

    const user: AuthUser = { nome: record.nome, email, admin: MEMBER_EMAILS.includes(email) };
    if (record.foto) user.foto = record.foto;
    this.sessionState.set(user);
    this.saveUser(user);
    this.fecharModal();
    return true;
  }

  register(credentials: AuthCredentials): boolean {
    const email = credentials.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || !credentials.senha.trim()) return false;

    const users = this.loadUsers();
    if (users.some((user) => user.email === email)) return false;

    const record: StoredUser = {
      nome: credentials.nome?.trim() || email.split('@')[0],
      email,
      senha: credentials.senha,
    };
    if (credentials.foto) record.foto = credentials.foto;

    try {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, record]));
    } catch {
      return false;
    }
    return this.login({ ...credentials, email });
  }

  logout(): void {
    this.sessionState.set(null);
    if (this.hasStorage()) { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(LEGACY_SESSION_KEY); }
    this.fecharModal();
  }

  atualizarFoto(foto: string): void {
    const atual = this.sessionState();
    if (!atual) return;
    const updated: AuthUser = { ...atual, foto };
    this.sessionState.set(updated);
    this.saveUser(updated);

    const users = this.loadUsers().map((user) => (user.email === updated.email ? { ...user, foto } : user));
    if (this.hasStorage()) localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  getStorageKeyForUser(email: string): string {
    return `gamodan-games:${email.trim().toLowerCase()}`;
  }

  private loadUser(): AuthUser | null {
    if (!this.hasStorage()) return null;
    const raw = localStorage.getItem(SESSION_KEY) ?? localStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as Partial<AuthUser>;
      const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
      if (typeof user.nome === 'string' && user.nome.trim() && EMAIL_PATTERN.test(email)) {
        const normalized: AuthUser = { nome: user.nome.trim(), email, admin: MEMBER_EMAILS.includes(email) };
        if (typeof user.foto === 'string' && user.foto) normalized.foto = user.foto;
        this.saveUser(normalized);
        return normalized;
      }
    } catch {}
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    return null;
  }

  private loadUsers(): StoredUser[] {
    if (!this.hasStorage()) return [];
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const parsed = raw ? JSON.parse(raw) as StoredUser[] : [];
      return Array.isArray(parsed)
        ? parsed.filter((user) => typeof user.email === 'string' && typeof user.senha === 'string')
        : [];
    } catch {
      return [];
    }
  }

  private saveUser(user: AuthUser): void {
    if (this.hasStorage()) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
