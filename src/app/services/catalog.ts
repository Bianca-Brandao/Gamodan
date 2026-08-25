import { Injectable, signal } from '@angular/core';

export interface CatalogItem {
  nome: string;
  imagem: string;
}

const CATALOG_KEY = 'gamodan-catalog';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly state = signal<CatalogItem[]>(this.load());
  readonly items = this.state.asReadonly();

  addItem(item: CatalogItem): void {
    const exists = this.state().some((entry) => entry.nome.trim().toLowerCase() === item.nome.trim().toLowerCase());
    if (exists) return;
    const items = [...this.state(), item];
    this.state.set(items);
    this.persist(items);
  }

  updateItem(nome: string, changes: CatalogItem): void {
    const items = this.state().map((entry) => (entry.nome === nome ? changes : entry));
    this.state.set(items);
    this.persist(items);
  }

  removeItem(nome: string): void {
    const items = this.state().filter((entry) => entry.nome !== nome);
    this.state.set(items);
    this.persist(items);
  }

  private persist(items: CatalogItem[]): void {
    try {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
    } catch {}
  }

  buscar(termo: string): CatalogItem[] {
    const normalizado = termo.trim().toLowerCase();
    if (!normalizado) return [];
    return this.state().filter((item) => item.nome.toLowerCase().includes(normalizado)).slice(0, 5);
  }

  private load(): CatalogItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      const parsed = raw ? JSON.parse(raw) as CatalogItem[] : [];
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item.nome === 'string' && typeof item.imagem === 'string') : [];
    } catch {
      return [];
    }
  }
}
