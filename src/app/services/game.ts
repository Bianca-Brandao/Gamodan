import { Injectable, signal } from '@angular/core';
import { Game } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly _games = signal<Game[]>([]);
  private nextId = 1;
  readonly games = this._games.asReadonly();

  addGame(game: Omit<Game, 'id'>) {
    const novo: Game = { ...game, id: this.nextId++ };
    this._games.update(lista => [...lista, novo]);
  }

  toggleFavorito(id: number) {
    this._games.update(lista =>
      lista.map(g => g.id === id ? { ...g, favorito: !g.favorito } : g)
    );
  }

  setStatus(id: number, status: Game['status']) {
    this._games.update(lista =>
      lista.map(g => g.id === id ? { ...g, status } : g)
    );
  }
}