import { Component, signal, computed, HostListener } from '@angular/core';
import { GameService } from '../services/game';

type Aba = 'favoritos' | 'recentemente' | 'wishlist';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private gameService: GameService) {}

  abaAtiva = signal<Aba>('recentemente');

  // % de scroll da página, de 0 a 100 - usado pra animar o gradiente
  scrollPercent = signal(0);

  jogosFiltrados = computed(() => {
    const todos = this.gameService.games();
    const aba = this.abaAtiva();

    if (aba === 'favoritos') {
      return todos.filter(j => j.favorito);
    }
    if (aba === 'wishlist') {
      return todos.filter(j => j.status === 'pendente');
    }
    // "recentemente" - os últimos adicionados primeiro
    return [...todos].sort((a, b) => b.id - a.id);
  });

  selecionarAba(aba: Aba) {
    this.abaAtiva.set(aba);
  }

  @HostListener('window:scroll')
  onScroll() {
    const alturaTotal = document.body.scrollHeight - window.innerHeight;
    const percentual = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    this.scrollPercent.set(percentual);
  }

  // gera um array [1,2,3] pra desenhar as estrelas no html
  estrelasArray(qtd: number) {
    return Array(3).fill(0).map((_, i) => i < qtd);
  }
}