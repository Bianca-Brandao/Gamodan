import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({ selector: 'app-admin', imports: [ReactiveFormsModule], templateUrl: './admin.html', styleUrl: './admin.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class Admin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  erro = false;
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], senha: ['', Validators.required] });
  entrar(): void { if (this.form.invalid) return this.form.markAllAsTouched(); if (!this.auth.login({ ...this.form.getRawValue(), nome: 'Administrador' })) { this.erro = true; return; } void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/'); }
}
