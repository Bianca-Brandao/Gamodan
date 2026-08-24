import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameStatus } from '../models/game.model';
import { GameService } from '../services/game';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.html',
  styleUrl: './status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Status {
  private readonly gameService = inject(GameService);
  grupos = computed(() => (['pendente', 'jogando', 'finalizado'] as GameStatus[]).map(status => ({ status, jogos: this.gameService.games().filter(jogo => jogo.status === status) })));
  alterarStatus(id: number, status: string) { this.gameService.setStatus(id, status as GameStatus); }
}
