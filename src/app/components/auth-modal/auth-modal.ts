import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthMode, AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModal {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  readonly loginForm = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], senha: ['', Validators.required] });
  readonly cadastroForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    confirmar: ['', [Validators.required, (control) => this.validarConfirmacao(control)]],
  });
  erroAcesso = false;
  readonly fotoCadastro = signal('');
  readonly mostrarSenhaLogin = signal(false);
  readonly mostrarSenhaCadastro = signal(false);
  readonly mostrarConfirmacao = signal(false);

  constructor() {
    this.cadastroForm.controls.senha.valueChanges.subscribe(() => this.cadastroForm.controls.confirmar.updateValueAndValidity());
  }

  private validarConfirmacao(control: { value: string }): ValidationErrors | null {
    if (!this.cadastroForm) return null;
    return control.value === this.cadastroForm.controls.senha.value ? null : { mismatch: true };
  }

  alternarSenha(form: 'login' | 'cadastro' | 'confirmar'): void {
    if (form === 'login') this.mostrarSenhaLogin.update((v) => !v);
    else if (form === 'cadastro') this.mostrarSenhaCadastro.update((v) => !v);
    else this.mostrarConfirmacao.update((v) => !v);
  }

  selecionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.fotoCadastro.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  mudarModo(modo: AuthMode): void { this.erroAcesso = false; this.auth.abrirModal(modo); }
  irAdmin(): void { this.auth.fecharModal(); void this.router.navigateByUrl('/admin'); }
  entrar(): void { if (this.loginForm.invalid) return this.loginForm.markAllAsTouched(); const value = this.loginForm.getRawValue(); this.erroAcesso = !this.auth.login({ ...value, nome: value.email.split('@')[0] }); if (!this.erroAcesso) this.loginForm.reset(); }
  cadastrar(): void { if (this.cadastroForm.invalid) return this.cadastroForm.markAllAsTouched(); const foto = this.fotoCadastro(); this.erroAcesso = !this.auth.register({ ...this.cadastroForm.getRawValue(), ...(foto ? { foto } : {}) }); if (!this.erroAcesso) { this.cadastroForm.reset(); this.fotoCadastro.set(''); } }
  erro(form: 'login' | 'cadastro', field: string): boolean { const control = form === 'login' ? this.loginForm.get(field) : this.cadastroForm.get(field); return !!control && control.invalid && control.touched; }
}
