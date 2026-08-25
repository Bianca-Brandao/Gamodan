import { Injectable, effect, inject, signal } from '@angular/core';
import { Game } from '../models/game.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly auth = inject(AuthService);
  private readonly state = signal<Game[]>([]);
  private nextId = 1;
  readonly games = this.state.asReadonly();

  constructor() {
    effect(() => this.load(this.auth.usuario()));
  }

  addGame(game: Omit<Game, 'id'>): void {
    const games = [...this.state(), { ...game, id: this.nextId++ }];
    this.state.set(games);
    this.save(games);
  }

  updateGame(id: number, changes: Omit<Game, 'id'>): void {
    const games = this.state().map((game) => (game.id === id ? { ...changes, id } : game));
    this.state.set(games);
    this.save(games);
  }

  removeGame(id: number): void {
    const games = this.state().filter((game) => game.id !== id);
    this.state.set(games);
    this.save(games);
  }

  toggleFavorito(id: number): void {
    const games = this.state().map((game) => game.id === id ? { ...game, favorito: !game.favorito } : game);
    this.state.set(games);
    this.save(games);
  }

  setStatus(id: number, status: Game['status']): void {
    const games = this.state().map((game) => game.id === id ? { ...game, status } : game);
    this.state.set(games);
    this.save(games);
  }

  private load(user: { email: string } | null): void {
    if (!user || typeof localStorage === 'undefined') {
      this.state.set([]);
      this.nextId = 1;
      return;
    }
    try {
      const raw = localStorage.getItem(this.auth.getStorageKeyForUser(user.email));
      const saved = raw ? JSON.parse(raw) as { games?: Game[]; nextId?: number } : null;
      const games = Array.isArray(saved?.games) ? saved.games : [];
      this.state.set(games);
      const nextId = saved?.nextId;
      this.nextId = typeof nextId === 'number' && Number.isInteger(nextId) && nextId > 0 ? nextId : Math.max(0, ...games.map((game) => game.id)) + 1;
    } catch {
      this.state.set([]);
      this.nextId = 1;
    }
  }

  private save(games: Game[]): void {
    const user = this.auth.usuario();
    if (user && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.auth.getStorageKeyForUser(user.email), JSON.stringify({ games, nextId: this.nextId }));
    }
  }
}
