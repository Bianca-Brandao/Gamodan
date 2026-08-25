# Gamodan

**Gamodan** é um catálogo pessoal de jogos: organize o que já jogou, o que está jogando e o que ainda quer jogar — tudo em um só lugar, com uma conta por pessoa e dados separados por login.

---

## Sobre o projeto

Projeto front-end em **Angular** (standalone components, signals e nova sintaxe de control flow). Os dados são persistidos localmente no navegador (`localStorage`), isolados por conta — não há backend.

### Funcionalidades

| Área | O que faz |
|---|---|
| **Home** | Carrossel com jogos em destaque, preview pública com jogos de amostra, cadastro de jogos com capa (arquivo ou URL), nota em estrelas, status e datas |
| **Conta** | Cadastro com foto de perfil e confirmação de senha, login com validação, sessão persistente e modal de acesso global em qualquer página |
| **Lista** | Grade dos jogos da conta com filtros (Todos, Favoritos, Wishlist e Status), edição completa, exclusão e ações rápidas por card |
| **Catálogo** *(admin)* | Acervo compartilhado de jogos gerenciado por administradoras: adicionar, editar e excluir |
| **Autocomplete** | Ao cadastrar um jogo, o nome sugere jogos do catálogo e preenche nome + capa automaticamente |
| **Perfil** | Avatar (upload com prévia), dados da conta e selo de administrador(a) |
| **Contato** | Integrantes do projeto com links de E-mail, LinkedIn e GitHub e busca por nome |

### Acesso administrativo

- Contas criadas com o e-mail de uma **integrante do projeto** (página Contato) recebem o papel de **admin** automaticamente.
- Admins enxergam o menu **Catálogo** (no lugar de Lista), gerenciam o acervo e o carrossel da Home passa a mostrar os jogos do catálogo, com edição e exclusão direto nos cards.
- Há um atalho discreto **"Entrar como administrador"** no modal de acesso, que leva à página de login administrativa.

---

## Estrutura do projeto

```
src/app/
├── app.ts / app.html / app.css     # Shell da aplicação (header + rotas + modal global)
├── app.config.ts                   # Configuração da aplicação
├── app.routes.ts                   # Rotas com lazy loading e guards
├── components/                     # Componentes reutilizados
│   ├── header/                     # Navegação principal
│   └── auth-modal/                 # Modal global de login/cadastro
├── home/                           # Página inicial (carrossel, cadastro de jogos)
├── lista/                          # Lista pessoal com filtros e edição
├── perfil/                         # Perfil da conta (avatar, dados, sair)
├── contato/                        # Integrantes do projeto
├── features/                       # Áreas restritas
│   ├── admin/                      # Login administrativo
│   └── catalogo/                   # Gerenciamento do catálogo (admins)
├── models/                         # Tipos de domínio (Game, GameStatus)
└── services/                       # Regras de negócio e persistência
    ├── auth.ts                     # Sessão, contas e papel de admin
    ├── auth-guard.ts               # Guards de rota (authGuard, adminGuard)
    ├── game.ts                     # Lista pessoal por conta
    └── catalog.ts                  # Catálogo compartilhado
```

Imagens estáticas ficam em `public/assets/` (`icons/` para a logo, `games/` para as capas de preview).

---

## Como executar

Requisitos: **Node.js** e **npm**.

```bash
npm install     # instalar dependências
npm start       # servidor de desenvolvimento (http://localhost:4200)
```

Outros comandos:

```bash
npm run build   # build de produção (pasta dist/)
npm test        # testes unitários (Vitest)
```

---

## Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Home com carrossel e preview |
| `/contato` | Público | Integrantes do projeto |
| `/admin` | Público | Login administrativo |
| `/lista` | Autenticado | Lista pessoal de jogos |
| `/perfil` | Autenticado | Perfil da conta |
| `/catalogo` | Administrador | Gerenciamento do catálogo |

Rotas desconhecidas redirecionam para a Home.

---

## Persistência de dados

Tudo é salvo no `localStorage` do navegador:

| Chave | Conteúdo |
|---|---|
| `gamodan-auth-user` | Sessão ativa da conta |
| `gamodan-users` | Contas cadastradas (nome, e-mail e senha) |
| `gamodan-games:<email>` | Lista de jogos da conta |
| `gamodan-catalog` | Catálogo compartilhado |

> Por usar armazenamento local, os dados ficam apenas no navegador em que a conta foi criada.

---

## Tecnologias

- [Angular](https://angular.dev) 22 — standalone components, signals, control flow moderno e lazy loading
- TypeScript (modo estrito)
- Vitest para testes unitários
- CSS puro com design system próprio (tema escuro, gradientes âmbar/vermelho)

---

## Equipe

Confira as integrantes na página **Contato** do site.
