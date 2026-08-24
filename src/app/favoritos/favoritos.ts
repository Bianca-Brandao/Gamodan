import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameService } from '../services/game';

@Component({
  selector: 'app-favoritos',
  imports: [],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Favoritos {
  private readonly gameService = inject(GameService);
  jogos = computed(() => this.gameService.games().filter(jogo => jogo.favorito));
  alternarFavorito(id: number) { this.gameService.toggleFavorito(id); }
}
