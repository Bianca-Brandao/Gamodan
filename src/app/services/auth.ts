import { Injectable, computed, signal } from '@angular/core';

export type AuthMode = 'entrar' | 'criar';

export interface AuthUser {
  nome: string;
  email: string;
}

interface LoginPayload {
  nome: string;
  email: string;
  senha: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'gamodan-auth-user';
  private readonly usuarioInicial = this.carregarUsuario();

  readonly usuario = signal<AuthUser | null>(this.usuarioInicial);
  readonly modalAberto = signal(false);
  readonly modo = signal<AuthMode>('entrar');
  readonly autenticado = computed(() => this.usuario() !== null);

  abrirModal(modo: AuthMode = 'entrar') {
    this.modo.set(modo);
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  login(payload: LoginPayload) {
    const usuario = { nome: payload.nome, email: payload.email };
    this.usuario.set(usuario);
    this.salvarUsuario(usuario);
    this.fecharModal();
  }

  register(payload: LoginPayload) {
    this.login(payload);
  }

  logout() {
    this.usuario.set(null);
    this.removerUsuario();
    this.fecharModal();
  }

  getStorageKeyForUser(email: string) {
    return `${this.storageKey}:${email}`;
  }

  private carregarUsuario(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const bruto = window.localStorage.getItem(this.storageKey);

    if (!bruto) {
      return null;
    }

    try {
      return JSON.parse(bruto) as AuthUser;
    } catch {
      return null;
    }
  }

  private salvarUsuario(usuario: AuthUser) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  private removerUsuario() {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }
}