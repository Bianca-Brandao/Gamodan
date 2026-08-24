import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameService } from '../services/game';
import { GameStatus } from '../models/game.model';

type Aba = 'favoritos' | 'recentemente';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class Home implements OnDestroy {
  private readonly gameService = inject(GameService);
  private readonly formBuilder = inject(FormBuilder);
  private autoplayId: ReturnType<typeof setInterval> | null = null;

  abaAtiva = signal<Aba>('recentemente');
  modalAberto = signal(false);
  imagemComErro = signal(false);
  jogoEditando = signal<number | null>(null);
  confirmacaoId = signal<number | null>(null);
  indiceAtual = signal(0);

  // % de scroll da página, de 0 a 100 - usado pra animar o gradiente
  scrollPercent = signal(0);

  jogosFiltrados = computed(() => {
    const todos = this.gameService.games();
    const aba = this.abaAtiva();

    if (aba === 'favoritos') {
      return todos.filter(j => j.favorito);
    }
    // "recentemente" - os últimos adicionados primeiro
    return [...todos].sort((a, b) => b.id - a.id);
  });

  jogosCarrossel = computed(() => this.jogosFiltrados().slice(0, 5));

  readonly temMultiplosJogos = computed(() => this.jogosCarrossel().length > 1);

  readonly formJogo = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    imagem: ['', [Validators.required, Validators.pattern(/^https:\/\/.+/i)]],
    estrelas: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    dataInicial: ['', [Validators.required]],
    dataFinal: [''],
    favorito: [false],
    status: ['pendente' as GameStatus],
  });

  constructor() {
    effect(
      () => {
        const total = this.jogosCarrossel().length;
        const modalAberto = this.modalAberto();

        if (total === 0) {
          this.indiceAtual.set(0);
        }

        if (total > 0 && this.indiceAtual() >= total) {
          this.indiceAtual.set(0);
        }

        this.configurarAutoplay(total, modalAberto);
      },
      { allowSignalWrites: true }
    );
  }

  selecionarAba(aba: Aba) {
    this.abaAtiva.set(aba);
    this.indiceAtual.set(0);
  }

  onScroll() {
    const alturaTotal = document.body.scrollHeight - window.innerHeight;
    const percentual = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    this.scrollPercent.set(percentual);
  }

  abrirModal() {
    this.jogoEditando.set(null);
    this.imagemComErro.set(false);
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  avancar() {
    const total = this.jogosCarrossel().length;
    if (total <= 1) {
      return;
    }
    this.indiceAtual.update(valor => (valor + 1) % total);
  }

  voltar() {
    const total = this.jogosCarrossel().length;
    if (total <= 1) {
      return;
    }
    this.indiceAtual.update(valor => (valor - 1 + total) % total);
  }

  irPara(indice: number) {
    this.indiceAtual.set(indice);
  }

  trackTransform() {
    return `translateX(calc(-${this.indiceAtual()} * (var(--carousel-card-width) + var(--carousel-gap))))`;
  }

  salvarJogo() {
    if (this.formJogo.invalid || this.imagemComErro()) {
      this.formJogo.markAllAsTouched();
      return;
    }

    const valor = this.formJogo.getRawValue();

    const jogo = {
      nome: valor.nome,
      imagem: valor.imagem,
      estrelas: valor.estrelas,
      dataInicial: valor.dataInicial,
      dataFinal: valor.dataFinal || undefined,
      favorito: valor.favorito,
      status: valor.status,
    };
    const id = this.jogoEditando();
    if (id === null) this.gameService.addGame(jogo);
    else this.gameService.updateGame(id, jogo);

    this.formJogo.reset({
      nome: '',
      imagem: '',
      estrelas: 3,
      dataInicial: '',
      dataFinal: '',
      favorito: false,
      status: 'pendente',
    });

    this.abaAtiva.set('recentemente');
    this.indiceAtual.set(0);
    this.fecharModal();
  }

  editarJogo(id: number) {
    const jogo = this.gameService.games().find(item => item.id === id);
    if (!jogo) return;
    this.jogoEditando.set(id);
    this.imagemComErro.set(false);
    this.formJogo.patchValue(jogo);
    this.modalAberto.set(true);
  }

  imagemFalhou() { this.imagemComErro.set(true); }

  selecionarEstrelas(valor: number) { this.formJogo.controls.estrelas.setValue(valor); }

  excluirJogo(id: number) {
    this.confirmacaoId.set(id);
  }

  confirmarExclusao() {
    const id = this.confirmacaoId();
    if (id !== null) this.gameService.removeGame(id);
    this.confirmacaoId.set(null);
  }

  ngOnDestroy() {
    this.limparAutoplay();
  }

  private configurarAutoplay(total: number, modalAberto: boolean) {
    this.limparAutoplay();

    if (total <= 1 || modalAberto) {
      return;
    }

    this.autoplayId = setInterval(() => {
      this.avancar();
    }, 3500);
  }

  private limparAutoplay() {
    if (this.autoplayId !== null) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

  // gera um array [1,2,3] pra desenhar as estrelas no html
  estrelasArray(qtd: number) {
    return Array(5).fill(0).map((_, i) => i < qtd);
  }
}