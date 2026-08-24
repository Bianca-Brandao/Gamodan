import { Injectable, signal } from '@angular/core';
import { Game } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly storageKey = 'gamodan-games';
  private readonly _games = signal<Game[]>(this.carregarJogos());
  readonly games = this._games.asReadonly();

  addGame(game: Omit<Game, 'id'>) {
    const novo: Game = { ...game, id: Date.now() };
    this.atualizar(lista => [...lista, novo]);
  }

  updateGame(id: number, changes: Omit<Game, 'id'>) {
    this.atualizar(lista => lista.map(game => game.id === id ? { ...changes, id } : game));
  }

  removeGame(id: number) {
    this.atualizar(lista => lista.filter(game => game.id !== id));
  }

  toggleFavorito(id: number) {
    this.atualizar(lista =>
      lista.map(g => g.id === id ? { ...g, favorito: !g.favorito } : g)
    );
  }

  setStatus(id: number, status: Game['status']) {
    this.atualizar(lista =>
      lista.map(g => g.id === id ? { ...g, status } : g)
    );
  }

  private atualizar(transformar: (lista: Game[]) => Game[]) {
    this._games.update(lista => {
      const atualizada = transformar(lista);
      localStorage.setItem(this.storageKey, JSON.stringify(atualizada));
      return atualizada;
    });
  }

  private carregarJogos(): Game[] {
    try {
      const salvos = localStorage.getItem(this.storageKey);
      return salvos ? JSON.parse(salvos) as Game[] : [];
    } catch {
      return [];
    }
  }
}