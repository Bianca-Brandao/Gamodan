import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    });
    TestBed.configureTestingModule({});
  });

  it('registers, logs in and provides user storage key', () => {
    const service = TestBed.inject(AuthService);
    expect(service.register({ email: 'user@example.com', senha: '1' })).toBe(true);
    service.logout();
    expect(service.login({ email: 'user@example.com', senha: '1' })).toBe(true);
    expect(service.usuario()?.email).toBe('user@example.com');
    expect(service.admin()).toBe(false);
    expect(service.getStorageKeyForUser('USER@example.com')).toBe('gamodan-games:user@example.com');
  });

  it('rejects unknown or wrong credentials and clears session on logout', () => {
    const service = TestBed.inject(AuthService);
    expect(service.login({ email: 'invalid', senha: 'x' })).toBe(false);
    expect(service.autenticado()).toBe(false);
    expect(service.register({ nome: 'Pessoa', email: 'person@example.com', senha: '1' })).toBe(true);
    service.logout();
    expect(service.login({ email: 'person@example.com', senha: 'errada' })).toBe(false);
    expect(service.login({ email: 'person@example.com', senha: '1' })).toBe(true);
    service.logout();
    expect(service.usuario()).toBeNull();
    expect(localStorage.getItem('gamodan-auth-user')).toBeNull();
  });

  it('marks project members as admin on login', () => {
    const service = TestBed.inject(AuthService);
    expect(service.register({ nome: 'Bianca', email: 'bianca.brandao.bbs@gmail.com', senha: '1' })).toBe(true);
    expect(service.usuario()?.admin).toBe(true);
  });
});
