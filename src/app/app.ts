import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModal } from './components/auth-modal/auth-modal';
import { Header } from './components/header/header';
@Component({ selector: 'app-root', imports: [Header, RouterOutlet, AuthModal], templateUrl: './app.html', styleUrl: './app.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class App {}
