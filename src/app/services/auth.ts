import { Injectable, computed, signal } from '@angular/core';

export type AuthMode = 'entrar' | 'criar';

type AuthCredentials = {
  nome?: string;
  email: string;
  senha: string;
};

type AuthSession = {
  nome: string;
  email: string;
  admin: boolean;
};

const SESSION_KEY = 'gamodan-auth';
const LEGACY_LOGADO_KEY = 'logado';
const ADMIN_EMAIL = 'admin@gamodan.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly modalAbertoState = signal(false);
  private readonly modoState = signal<AuthMode>('entrar');
  private readonly sessionState = signal<AuthSession | null>(this.carregarSessao());

  readonly modalAberto = this.modalAbertoState.asReadonly();
  readonly modo = this.modoState.asReadonly();
  readonly autenticado = computed(() => this.sessionState() !== null);
  readonly isLogado = this.autenticado;
  readonly admin = computed(() => this.sessionState()?.admin ?? false);
  readonly usuario = computed(() => this.sessionState());

  abrirModal(modo: AuthMode): void {
    this.modoState.set(modo);
    this.modalAbertoState.set(true);
  }

  fecharModal(): void {
    this.modalAbertoState.set(false);
  }

  login(credenciais: AuthCredentials | string, senha?: string): boolean {
    const dados = this.normalizarCredenciais(credenciais, senha);

    if (!dados) {
      return false;
    }

    const email = this.normalizarEmail(dados.email);
    const admin = this.ehEmailAdmin(email);
    const nome = dados.nome?.trim() || this.extrairNome(email) || (admin ? 'Administrador' : 'Usuário');

    this.salvarSessao({
      nome,
      email,
      admin,
    });

    this.fecharModal();
    return true;
  }

  register(dados: AuthCredentials): boolean {
    return this.login(dados);
  }

  logout(): void {
    if (this.temStorage()) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_LOGADO_KEY);
    }

    this.sessionState.set(null);
    this.fecharModal();
  }

  private normalizarCredenciais(credenciais: AuthCredentials | string, senha?: string): AuthCredentials | null {
    if (typeof credenciais === 'string') {
      if (!senha) {
        return null;
      }

      return {
        email: credenciais,
        senha,
      };
    }

    if (!credenciais.email || !credenciais.senha) {
      return null;
    }

    return credenciais;
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private ehEmailAdmin(email: string): boolean {
    return email === ADMIN_EMAIL;
  }

  private extrairNome(email: string): string {
    const nome = email.split('@')[0]?.trim();
    return nome || 'Usuário';
  }

  private salvarSessao(sessao: AuthSession): void {
    this.sessionState.set(sessao);

    if (!this.temStorage()) {
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
    localStorage.setItem(LEGACY_LOGADO_KEY, 'true');
  }

  private carregarSessao(): AuthSession | null {
    if (!this.temStorage()) {
      return null;
    }

    const sessaoSalva = localStorage.getItem(SESSION_KEY);
    if (sessaoSalva) {
      try {
        const sessao = JSON.parse(sessaoSalva) as Partial<AuthSession>;
        if (typeof sessao.nome === 'string' && typeof sessao.email === 'string') {
          return {
            nome: sessao.nome,
            email: sessao.email,
            admin: Boolean(sessao.admin),
          };
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    if (localStorage.getItem(LEGACY_LOGADO_KEY) === 'true') {
      return {
        nome: 'Usuário',
        email: '',
        admin: false,
      };
    }

    return null;
  }

  private temStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}

export { AuthService as Auth };