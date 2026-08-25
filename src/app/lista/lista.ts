import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Game, GameStatus } from '../models/game.model';
import { AuthService } from '../services/auth';
import { GameService } from '../services/game';

type FiltroLista = 'todos' | 'favoritos' | 'wishlist' | GameStatus;

@Component({
  selector: 'app-lista',
  imports: [ReactiveFormsModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lista {
  private readonly games = inject(GameService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  readonly estrelas = [1, 2, 3, 4, 5];
  readonly filtro = signal<FiltroLista>('todos');
  readonly jogoSelecionado = signal<Game | null>(null);
  readonly editando = signal(false);

  readonly jogos = computed(() => {
    const todos = [...this.games.games()].sort((a, b) => b.id - a.id);
    const tipo = this.filtro();
    if (tipo === 'favoritos') return todos.filter((game) => game.favorito);
    if (tipo === 'wishlist') return todos.filter((game) => game.wishlist);
    if (tipo === 'pendente' || tipo === 'jogando' || tipo === 'finalizado') {
      return todos.filter((game) => game.status === tipo);
    }
    return todos;
  });

  readonly totalGeral = computed(() => this.games.games().length);
  readonly totalFavoritos = computed(() => this.games.games().filter((g) => g.favorito).length);
  readonly totalWishlist = computed(() => this.games.games().filter((g) => g.wishlist).length);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    imagem: ['', [Validators.required]],
    estrelas: [3, [Validators.min(0.5), Validators.max(5)]],
    dataInicial: ['', Validators.required],
    dataFinal: [''],
    favorito: [false],
    wishlist: [false],
    status: ['pendente' as GameStatus],
  });

  definirFiltro(tipo: FiltroLista): void {
    this.filtro.set(tipo);
  }

  readonly filtroStatusSelecionado = computed(() => {
    const tipo = this.filtro();
    return tipo === 'jogando' || tipo === 'pendente' || tipo === 'finalizado' ? tipo : '';
  });

  definirFiltroStatus(status: string): void {
    this.filtro.set(status === '' ? 'todos' : (status as GameStatus));
  }

  abrirDetalhes(jogo: Game): void {
    this.jogoSelecionado.set(jogo);
    this.editando.set(false);
  }

  iniciarEdicao(jogo: Game, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.jogoSelecionado.set(jogo);
    this.editando.set(true);
    this.form.reset({
      nome: jogo.nome,
      imagem: jogo.imagem,
      estrelas: jogo.estrelas,
      dataInicial: jogo.dataInicial,
      dataFinal: jogo.dataFinal ?? '',
      favorito: jogo.favorito,
      wishlist: jogo.wishlist,
      status: jogo.status,
    });
  }

  fecharModal(): void {
    this.jogoSelecionado.set(null);
    this.editando.set(false);
  }

  salvarEdicao(): void {
    const atual = this.jogoSelecionado();
    if (!atual) return;
    if (this.form.invalid) return this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    this.games.updateGame(atual.id, {
      ...value,
      dataFinal: value.dataFinal || undefined,
    });
    const atualizado = this.games.games().find((g) => g.id === atual.id) ?? null;
    this.jogoSelecionado.set(atualizado);
    this.editando.set(false);
  }

  excluirJogo(id: number, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.games.removeGame(id);
    if (this.jogoSelecionado()?.id === id) {
      this.fecharModal();
    }
  }

  alterarStatus(id: number, status: string, event: Event): void {
    event.stopPropagation();
    if (status === 'pendente' || status === 'jogando' || status === 'finalizado') {
      this.games.setStatus(id, status);
    }
  }

  alternarFavorito(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.games.toggleFavorito(id);
  }

  definirEstrelas(star: number, event: MouseEvent): void {
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.form.controls.estrelas.setValue(event.clientX - box.left <= box.width / 2 ? star - 0.5 : star);
  }

  selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.form.controls.imagem.setValue(String(reader.result));
    reader.readAsDataURL(file);
  }

  estadoEstrela(value: number, star: number): string {
    return value >= star ? 'full' : value >= star - 0.5 ? 'half' : '';
  }

  formatarData(value: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
  }
}
