import { Injectable, signal } from '@angular/core';
import { Game } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {

  private readonly _games = signal<Game[]>([]);

  private nextId = 1;

  readonly games = this._games.asReadonly();

  // Adicionar jogo
  addGame(game: Omit<Game, 'id'>) {
    const novo: Game = {
      ...game,
      id: this.nextId++
    };

    this._games.update(lista => [...lista, novo]);
  }

  // Favoritar / desfavoritar
  toggleFavorito(id: number) {
    this._games.update(lista =>
      lista.map(g =>
        g.id === id
          ? { ...g, favorito: !g.favorito }
          : g
      )
    );
  }

  // REMOVER JOGO
  removeGame(id: number) {
    this._games.update(lista =>
      lista.filter(jogo => jogo.id !== id)
    );
  }

  // Alterar status
  setStatus(id: number, status: Game['status']) {
    this._games.update(lista =>
      lista.map(g =>
        g.id === id
          ? { ...g, status }
          : g
      )
    );
  }
}