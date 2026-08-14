export type GameStatus = 'pendente' | 'jogando' | 'finalizado';

export interface Game {
  id: number;
  nome: string;
  imagem: string;
  estrelas: number; // 1 a 3
  dataInicial: string;
  dataFinal?: string;
  favorito: boolean;
  status: GameStatus;
}