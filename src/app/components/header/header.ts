import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthMode, AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  abrirAutenticacao(modo: AuthMode): void { this.auth.abrirModal(modo); }
  sair(): void { this.auth.logout(); void this.router.navigateByUrl('/'); }
}
