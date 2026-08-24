import { TestBed } from '@angular/core/testing';

import { GameService } from './game';

describe('Game', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add, update and remove a game', () => {
    service.addGame({ nome: 'Teste', imagem: 'https://example.com/capa.jpg', estrelas: 5, dataInicial: '2026-01-01', favorito: false, status: 'pendente' });
    const id = service.games()[0].id;

    service.updateGame(id, { nome: 'Atualizado', imagem: 'https://example.com/nova.jpg', estrelas: 4, dataInicial: '2026-01-01', favorito: true, status: 'jogando' });
    expect(service.games()[0].nome).toBe('Atualizado');
    expect(service.games()[0].status).toBe('jogando');

    service.removeGame(id);
    expect(service.games()).toHaveLength(0);
  });
});
