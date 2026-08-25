import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogItem, CatalogService } from '../../services/catalog';

@Component({
  selector: 'app-catalogo',
  imports: [ReactiveFormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogo {
  private readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);

  readonly itens = this.catalog.items;
  readonly selecionado = signal<CatalogItem | null>(null);
  readonly editando = signal(false);
  readonly adicionando = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    imagem: ['', [Validators.required]],
  });

  abrirDetalhes(item: CatalogItem): void {
    this.selecionado.set(item);
    this.editando.set(false);
  }

  iniciarEdicao(item: CatalogItem, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.selecionado.set(item);
    this.editando.set(true);
    this.form.reset({ nome: item.nome, imagem: item.imagem });
  }

  abrirAdicao(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.form.reset({ nome: '', imagem: '' });
    this.selecionado.set(null);
    this.adicionando.set(true);
  }

  fecharModal(): void {
    this.selecionado.set(null);
    this.editando.set(false);
    this.adicionando.set(false);
  }

  salvar(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const value = this.form.getRawValue();

    if (this.adicionando()) {
      this.catalog.addItem(value);
      this.fecharModal();
      return;
    }

    const atual = this.selecionado();
    if (!atual) return;
    this.catalog.updateItem(atual.nome, value);
    this.selecionado.set(this.catalog.items().find((item) => item.nome === value.nome) ?? null);
    this.editando.set(false);
  }

  excluir(nome: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.catalog.removeItem(nome);
    if (this.selecionado()?.nome === nome) this.fecharModal();
  }

  selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.form.controls.imagem.setValue(String(reader.result));
    reader.readAsDataURL(file);
  }
}
