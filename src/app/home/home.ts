import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Game } from '../models/game.model';
import { AuthService } from '../services/auth';
import { CatalogItem, CatalogService } from '../services/catalog';
import { GameService } from '../services/game';

type Aba = 'recentemente' | 'favoritos';
@Component({ selector: 'app-home', imports: [ReactiveFormsModule], templateUrl: './home.html', styleUrl: './home.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class Home implements OnDestroy {
  private readonly games = inject(GameService);
  private readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  private autoplay: ReturnType<typeof setInterval> | null = null;
  readonly estrelas = [1, 2, 3, 4, 5];
  readonly aba = signal<Aba>('recentemente');
  readonly modalAberto = signal(false);
  readonly catalogoAberto = signal(false);
  readonly detalhes = signal<Game | null>(null);
  readonly indice = signal(0);
  readonly termoBusca = signal('');
  readonly previewJogos: Game[] = [
    { id: 101, nome: 'Minecraft', imagem: 'assets/games/minecraft.jpeg', estrelas: 5, dataInicial: '2026-01-10', favorito: true, wishlist: false, status: 'jogando' },
    { id: 102, nome: 'Hollow Knight', imagem: 'assets/games/hollowknight.jpg', estrelas: 5, dataInicial: '2026-01-15', favorito: true, wishlist: false, status: 'finalizado' },
    { id: 103, nome: 'Stardew Valley', imagem: 'assets/games/stardewvalley.jpg', estrelas: 4.5, dataInicial: '2026-02-01', favorito: false, wishlist: true, status: 'pendente' },
    { id: 104, nome: 'Grand Theft Auto V', imagem: 'assets/games/grandtheftautoV.jpg', estrelas: 4, dataInicial: '2026-02-05', favorito: false, wishlist: false, status: 'jogando' },
    { id: 105, nome: 'Undertale', imagem: 'assets/games/undertale.jpg', estrelas: 5, dataInicial: '2026-02-10', favorito: true, wishlist: false, status: 'finalizado' },
    { id: 106, nome: 'Red Dead Redemption 2', imagem: 'assets/games/reddeadredemption.jpg', estrelas: 5, dataInicial: '2026-02-15', favorito: true, wishlist: true, status: 'pendente' },
  ];

  readonly jogos = computed(() => {
    if (this.auth.admin()) {
      return this.catalog.items().map((item, index) => ({ id: index + 1, nome: item.nome, imagem: item.imagem, estrelas: 3, dataInicial: '', favorito: false, wishlist: false, status: 'pendente' as const }));
    }
    if (!this.auth.autenticado()) return this.previewJogos;
    const base = this.aba() === 'favoritos' ? this.games.games().filter((game) => game.favorito) : [...this.games.games()].sort((a, b) => b.id - a.id);
    return base.length ? base.slice(0, 6) : this.previewJogos;
  });
  readonly visiveis = computed(() => { const games = this.jogos(); if (games.length <= 3) return games; const index = this.indice() % games.length; return [games[(index - 1 + games.length) % games.length], games[index], games[(index + 1) % games.length]]; });
  readonly form = this.fb.nonNullable.group({ nome: ['', [Validators.required, Validators.maxLength(50)]], imagem: ['', [Validators.required]], estrelas: [3, [Validators.min(.5), Validators.max(5)]], dataInicial: ['', Validators.required], dataFinal: [''], favorito: [false], wishlist: [false], status: ['pendente' as const] });
  readonly formCatalogo = this.fb.nonNullable.group({ nome: ['', [Validators.required, Validators.maxLength(50)]], imagem: ['', [Validators.required]] });
  readonly sugestoes = computed(() => this.catalog.buscar(this.termoBusca()));
  readonly catalogoEditando = signal<string | null>(null);
  constructor() { effect(() => { const total = this.jogos().length; if (this.indice() >= total) this.indice.set(0); this.limparAutoplay(); if (total > 1 && !this.modalAberto() && !this.detalhes()) this.autoplay = setInterval(() => this.avancar(), 3500); }, { allowSignalWrites: true }); }
  abrirJogo(): void { if (this.auth.autenticado()) this.modalAberto.set(true); else this.auth.abrirModal('entrar'); }
  abrirCatalogo(jogo?: Game, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (jogo) {
      this.catalogoEditando.set(jogo.nome);
      this.formCatalogo.reset({ nome: jogo.nome, imagem: jogo.imagem });
    } else {
      this.catalogoEditando.set(null);
      this.formCatalogo.reset({ nome: '', imagem: '' });
    }
    this.catalogoAberto.set(true);
  }
  excluirCatalogo(nome: string, event: MouseEvent): void { event.stopPropagation(); this.catalog.removeItem(nome); if (this.catalogoEditando() === nome) { this.catalogoEditando.set(null); this.catalogoAberto.set(false); } }
  selecionarArquivoCatalogo(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => this.formCatalogo.controls.imagem.setValue(String(reader.result)); reader.readAsDataURL(file); }
  onNomeInput(event: Event): void { this.termoBusca.set((event.target as HTMLInputElement).value); }
  selecionarSugestao(item: CatalogItem): void { this.form.controls.nome.setValue(item.nome); this.form.controls.imagem.setValue(item.imagem); this.termoBusca.set(''); }
  salvarCatalogo(): void { if (this.formCatalogo.invalid) return this.formCatalogo.markAllAsTouched(); const value = this.formCatalogo.getRawValue(); const original = this.catalogoEditando(); if (original) this.catalog.updateItem(original, value); else this.catalog.addItem(value); this.formCatalogo.reset({ nome: '', imagem: '' }); this.termoBusca.set(''); this.catalogoEditando.set(null); this.catalogoAberto.set(false); }
  filtrar(): void { if (!this.auth.autenticado()) return this.auth.abrirModal('entrar'); this.aba.set(this.aba() === 'recentemente' ? 'favoritos' : 'recentemente'); this.indice.set(0); }
  avancar(): void { const total = this.jogos().length; if (total > 1) this.indice.update((value) => (value + 1) % total); }
  voltar(): void { const total = this.jogos().length; if (total > 1) this.indice.update((value) => (value - 1 + total) % total); }
  irPara(index: number): void { this.indice.set(index); }
  abrirDetalhes(game: Game): void { if (!this.auth.autenticado()) return this.auth.abrirModal('entrar'); this.detalhes.set(game); }
  salvar(): void { if (this.form.invalid) return this.form.markAllAsTouched(); const value = this.form.getRawValue(); this.games.addGame({ ...value, dataFinal: value.dataFinal || undefined }); this.form.reset({ nome: '', imagem: '', estrelas: 3, dataInicial: '', dataFinal: '', favorito: false, wishlist: false, status: 'pendente' }); this.termoBusca.set(''); this.modalAberto.set(false); this.aba.set('recentemente'); }
  definirEstrelas(star: number, event: MouseEvent): void { const box = (event.currentTarget as HTMLElement).getBoundingClientRect(); this.form.controls.estrelas.setValue(event.clientX - box.left <= box.width / 2 ? star - .5 : star); }
  selecionarArquivo(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => this.form.controls.imagem.setValue(String(reader.result)); reader.readAsDataURL(file); }
  estadoEstrela(value: number, star: number): string { return value >= star ? 'full' : value >= star - .5 ? 'half' : ''; }
  formatarData(value: string): string { return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`)); }
  ngOnDestroy(): void { this.limparAutoplay(); }
  private limparAutoplay(): void { if (this.autoplay) clearInterval(this.autoplay); this.autoplay = null; }
}
