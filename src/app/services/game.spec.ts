import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { GameService } from './game';

describe('GameService', () => {
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

  it('adds, updates, sets status and removes games for authenticated user', () => {
    const auth = TestBed.inject(AuthService);
    const games = TestBed.inject(GameService);

    auth.register({ email: 'player@example.com', senha: '123' });
    games.addGame({
      nome: 'Zelda',
      imagem: 'https://example.com/zelda.png',
      estrelas: 5,
      dataInicial: '2026-01-01',
      favorito: false,
      wishlist: false,
      status: 'jogando',
    });

    expect(games.games().length).toBe(1);
    const id = games.games()[0].id;

    games.toggleFavorito(id);
    expect(games.games()[0].favorito).toBe(true);

    games.setStatus(id, 'finalizado');
    expect(games.games()[0].status).toBe('finalizado');

    games.updateGame(id, {
      nome: 'Zelda BOTW',
      imagem: 'https://example.com/zelda.png',
      estrelas: 5,
      dataInicial: '2026-01-01',
      favorito: true,
      wishlist: false,
      status: 'finalizado',
    });
    expect(games.games()[0].nome).toBe('Zelda BOTW');

    games.removeGame(id);
    expect(games.games().length).toBe(0);
  });
});
