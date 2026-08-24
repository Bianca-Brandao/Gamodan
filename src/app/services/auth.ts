import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {
  private logado = signal<boolean>(localStorage.getItem('logado') === 'true');
  isLogado = this.logado.asReadonly();

  login(usuario: string, senha: string): boolean {
    if (usuario === 'admin' && senha === '1234') {
      localStorage.setItem('logado', 'true');
      this.logado.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('logado');
    this.logado.set(false);
  }
}