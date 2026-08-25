export type GameStatus = 'pendente' | 'jogando' | 'finalizado';

export interface Game {
  id: number;
  nome: string;
  imagem: string;
  estrelas: number;
  dataInicial: string;
  dataFinal?: string;
  favorito: boolean;
  wishlist: boolean;
  status: GameStatus;
}
