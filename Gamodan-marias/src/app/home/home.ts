import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Game } from '../models/game.model';
import { GameService } from '../services/game';

type Aba = 'favoritos' | 'recentemente';

type SlotCarrossel = 'single' | 'center' | 'prev' | 'next';

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

  readonly estrelasDisponiveis = [1, 2, 3];

  abaAtiva = signal<Aba>('recentemente');

  modalAberto = signal(false);

  detalheAberto = signal(false);

  jogoSelecionado = signal<Game | null>(null);

  indiceAtual = signal(0);

  // Porcentagem de scroll da página
  scrollPercent = signal(0);


  // =========================
  // FILTROS
  // =========================

  jogosFiltrados = computed(() => {

    const todos = this.gameService.games();

    const aba = this.abaAtiva();

    if (aba === 'favoritos') {

      return todos.filter(j => j.favorito);

    }

    // Mais recentemente adicionados primeiro
    return [...todos].sort((a, b) => b.id - a.id);

  });


  jogosCarrossel = computed(() =>
    this.jogosFiltrados().slice(0, 5)
  );


  // =========================
  // CARROSSEL
  // =========================

  carrosselVisivel = computed(() => {

    const jogos = this.jogosCarrossel();

    const total = jogos.length;

    if (total === 0) {
      return [];
    }

    if (total === 1) {

      return [
        {
          jogo: jogos[0],
          indiceOriginal: 0,
          slot: 'single' as SlotCarrossel
        }
      ];

    }

    if (total === 2) {

      const centro = this.indiceAtual() % 2;

      const proximo = (centro + 1) % 2;

      return [

        {
          jogo: jogos[centro],
          indiceOriginal: centro,
          slot: 'center' as SlotCarrossel
        },

        {
          jogo: jogos[proximo],
          indiceOriginal: proximo,
          slot: 'next' as SlotCarrossel
        }

      ];

    }

    const centro = this.indiceAtual();

    const anterior =
      (centro - 1 + total) % total;

    const proximo =
      (centro + 1) % total;

    return [

      {
        jogo: jogos[anterior],
        indiceOriginal: anterior,
        slot: 'prev' as SlotCarrossel
      },

      {
        jogo: jogos[centro],
        indiceOriginal: centro,
        slot: 'center' as SlotCarrossel
      },

      {
        jogo: jogos[proximo],
        indiceOriginal: proximo,
        slot: 'next' as SlotCarrossel
      }

    ];

  });


  readonly temMultiplosJogos = computed(() =>
    this.jogosCarrossel().length > 1
  );


  readonly rotuloFiltro = computed(() =>
    this.abaAtiva() === 'recentemente'
      ? 'Adicionados recentemente'
      : 'Favoritos'
  );


  readonly proximoFiltro = computed(() =>
    this.abaAtiva() === 'recentemente'
      ? 'Favoritos'
      : 'Adicionados recentemente'
  );


  // =========================
  // FORMULÁRIO
  // =========================

  readonly formJogo =
    this.formBuilder.nonNullable.group({

      nome: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      imagem: [
        '',
        [
          Validators.required
        ]
      ],

      estrelas: [
        3,
        [
          Validators.required,
          Validators.min(0.3),
          Validators.max(3)
        ]
      ],

      dataInicial: [
        '',
        [
          Validators.required
        ]
      ],

      dataFinal: [''],

      favorito: [false],

      wishlist: [false],

      status: [
        'pendente' as const
      ]

    });


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor() {

    effect(

      () => {

        const total =
          this.jogosCarrossel().length;

        const modalAberto =
          this.modalAberto();


        if (total === 0) {

          this.indiceAtual.set(0);

        }


        if (
          total > 0 &&
          this.indiceAtual() >= total
        ) {

          this.indiceAtual.set(0);

        }


        this.configurarAutoplay(
          total,
          modalAberto
        );

      },

      {
        allowSignalWrites: true
      }

    );

  }


  // =========================
  // ABAS
  // =========================

  selecionarAba(aba: Aba) {

    this.abaAtiva.set(aba);

    this.indiceAtual.set(0);

  }


  alternarAba() {

    this.selecionarAba(

      this.abaAtiva() === 'recentemente'
        ? 'favoritos'
        : 'recentemente'

    );

  }


  // =========================
  // SCROLL
  // =========================

  onScroll() {

    const alturaTotal =
      document.body.scrollHeight -
      window.innerHeight;

    const percentual =
      alturaTotal > 0
        ? (window.scrollY / alturaTotal) * 100
        : 0;

    this.scrollPercent.set(percentual);

  }


  // =========================
  // MODAL ADICIONAR
  // =========================

  abrirModal() {

    this.jogoSelecionado.set(null);

    this.detalheAberto.set(false);

    this.modalAberto.set(true);

  }


  fecharModal() {

    this.modalAberto.set(false);

  }


  // =========================
  // DETALHES
  // =========================

  abrirDetalhes(jogo: Game) {

    this.modalAberto.set(false);

    this.jogoSelecionado.set(jogo);

    this.detalheAberto.set(true);

  }


  fecharDetalhes() {

    this.detalheAberto.set(false);

    this.jogoSelecionado.set(null);

  }


  // =========================
  // REMOVER JOGO
  // =========================

  removerJogo(jogo: Game) {

    const confirmar = confirm(
      `Tem certeza que deseja remover "${jogo.nome}" da sua lista?`
    );

    if (!confirmar) {
      return;
    }

    // Remove o jogo pelo ID
    this.gameService.removeGame(jogo.id);

    // Fecha o modal de detalhes
    this.fecharDetalhes();

    // Atualiza o índice do carrossel
    const total =
      this.jogosCarrossel().length;

    if (total === 0) {

      this.indiceAtual.set(0);

    } else if (
      this.indiceAtual() >= total
    ) {

      this.indiceAtual.set(total - 1);

    }

  }


  // =========================
  // CARROSSEL
  // =========================

  avancar() {

    const total =
      this.jogosCarrossel().length;

    if (total <= 1) {
      return;
    }

    this.indiceAtual.update(
      valor => (valor + 1) % total
    );

  }


  voltar() {

    const total =
      this.jogosCarrossel().length;

    if (total <= 1) {
      return;
    }

    this.indiceAtual.update(
      valor => (valor - 1 + total) % total
    );

  }


  irPara(indice: number) {

    this.indiceAtual.set(indice);

  }


  // =========================
  // ESTRELAS
  // =========================

  estadoEstrela(
    valor: number,
    estrela: number
  ) {

    const diferenca =
      valor - (estrela - 1);

    if (diferenca >= 1) {

      return 'cheia';

    }

    if (diferenca >= 0.3) {

      return 'meia';

    }

    return 'vazia';

  }


  definirEstrelas(
    estrela: number,
    event: MouseEvent
  ) {

    const alvo =
      event.currentTarget as HTMLElement | null;

    if (!alvo) {
      return;
    }

    const retangulo =
      alvo.getBoundingClientRect();

    const clicouNaMetadeEsquerda =
      event.detail > 0 &&
      event.clientX - retangulo.left <=
      retangulo.width / 2;

    const valor =
      clicouNaMetadeEsquerda
        ? estrela - 0.3
        : estrela;

    const valorNormalizado =
      Math.min(
        3,
        Math.max(0.3, valor)
      );

    this.formJogo.controls.estrelas
      .setValue(valorNormalizado);

  }


  legendaEstrela(valor: number) {

    const cheio =
      Math.floor(valor);

    const meio =
      valor % 1 >= 0.3 ? 1 : 0;

    return `${cheio} estrelas${meio ? ' e meio' : ''}`;

  }


  nomeEstrela(valor: number) {

    return `${valor} estrela${valor > 1 ? 's' : ''}`;

  }


  // =========================
  // DATA
  // =========================

  formatarDataBrasil(data: string) {

    return new Intl.DateTimeFormat(
      'pt-BR'
    ).format(
      new Date(`${data}T00:00:00`)
    );

  }


  // =========================
  // SALVAR JOGO
  // =========================

  salvarJogo() {

    if (this.formJogo.invalid) {

      this.formJogo.markAllAsTouched();

      return;

    }

    const valor =
      this.formJogo.getRawValue();

    this.gameService.addGame({

      nome: valor.nome,

      imagem: valor.imagem,

      estrelas: valor.estrelas,

      dataInicial: valor.dataInicial,

      dataFinal:
        valor.dataFinal || undefined,

      favorito:
        valor.favorito,

      wishlist:
        valor.wishlist,

      status:
        valor.status

    });


    this.formJogo.reset({

      nome: '',

      imagem: '',

      estrelas: 3,

      dataInicial: '',

      dataFinal: '',

      favorito: false,

      wishlist: false,

      status: 'pendente'

    });


    this.abaAtiva.set(
      'recentemente'
    );

    this.indiceAtual.set(0);

    this.fecharModal();

  }


  // =========================
  // AUTOPLAY
  // =========================

  ngOnDestroy() {

    this.limparAutoplay();

  }


  private configurarAutoplay(
    total: number,
    modalAberto: boolean
  ) {

    this.limparAutoplay();

    if (
      total <= 1 ||
      modalAberto
    ) {

      return;

    }

    this.autoplayId =
      setInterval(() => {

        this.avancar();

      }, 3500);

  }


  private limparAutoplay() {

    if (
      this.autoplayId !== null
    ) {

      clearInterval(
        this.autoplayId
      );

      this.autoplayId = null;

    }

  }

}