import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
@Component({ selector: 'app-perfil', templateUrl: './perfil.html', styleUrl: './perfil.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class Perfil {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void { this.auth.logout(); void this.router.navigateByUrl('/'); }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.auth.atualizarFoto(String(reader.result));
    reader.readAsDataURL(file);
  }
}
