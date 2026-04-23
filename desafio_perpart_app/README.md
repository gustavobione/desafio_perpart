# 🎲 Desafio Perpart — App Frontend

> **Next.js 16 + React 19 + UI-GovPE**
> Interface web responsiva para o Sistema de Aluguel de Jogos de Tabuleiro.

---

## 📋 Índice

- [Stack e Dependências](#stack)
- [Configuração do Ambiente (.env)](#env)
- [Instalação e Execução](#instalação)
- [Estrutura do Projeto](#estrutura)
- [Páginas e Rotas](#páginas)
- [Design System (UI-GovPE)](#design-system)
- [Autenticação e Proteção de Rotas](#autenticação)
- [Integração com a API](#api)
- [Funcionalidades Implementadas](#implementado)
- [Pendências](#pendências)

---

## Stack

| Pacote                 | Versão  | Uso                                         |
|------------------------|---------|---------------------------------------------|
| `next`                 | 16.2.4  | Framework React com App Router              |
| `react`                | 19.2.4  | Biblioteca de UI                            |
| `@uigovpe/components`  | ^1.1.38 | Design System do Governo de Pernambuco      |
| `@uigovpe/styles`      | ^1.1.19 | Estilos base do UI-GovPE                    |
| `axios`                | ^1.15   | Cliente HTTP para consumo da API            |
| `zustand`              | ^5.0    | Gerenciamento de estado global (auth)       |
| `zod`                  | ^4.3    | Validação de formulários (schema-first)     |
| `react-hook-form`      | ^7.73   | Gerenciamento de formulários                |
| `js-cookie`            | ^3.0    | Manipulação de cookies (armazenar JWT)      |
| `socket.io-client`     | ^4.8    | WebSocket para notificações em tempo real   |
| `tailwindcss`          | ^4.0    | Utilitários CSS complementares              |

---

## Env

Crie o arquivo `.env` na raiz de `desafio_perpart_app/`:

```env
# URL da API Backend (NestJS)
NEXT_PUBLIC_API_URL="http://localhost:3000"

# URL do próprio App (Next.js)
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

> As variáveis `NEXT_PUBLIC_*` são expostas ao browser automaticamente pelo Next.js.

---

## Instalação

```bash
cd desafio_perpart_app
npm install
```

### Iniciar em desenvolvimento

```bash
npm run dev
```

O app estará disponível em: **http://localhost:3001**

### Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com HMR
npm run build    # Build de produção
npm run start    # Iniciar build de produção
npm run lint     # Verificar erros de ESLint
```

---

## Estrutura

```
desafio_perpart_app/
│
├── app/                          # App Router do Next.js
│   ├── layout.tsx                # Root layout (fontes, providers globais)
│   ├── page.tsx                  # Redireciona para /dashboard ou /login
│   ├── globals.css               # Estilos globais + animações
│   │
│   ├── (auth)/                   # Grupo de rotas PÚBLICAS
│   │   ├── login/page.tsx        # Tela de login
│   │   └── register/page.tsx     # Tela de cadastro
│   │
│   └── (app)/                    # Grupo de rotas PROTEGIDAS
│       ├── layout.tsx            # Layout com Sidebar e Navbar
│       ├── dashboard/page.tsx    # Painel inicial
│       ├── products/
│       │   ├── page.tsx          # Listagem de jogos
│       │   ├── new/page.tsx      # Cadastrar novo jogo
│       │   └── [id]/
│       │       ├── page.tsx      # Detalhes do jogo
│       │       └── edit/page.tsx # Editar jogo
│       ├── loans/                # Empréstimos (parcial)
│       ├── categories/           # Categorias (parcial)
│       ├── users/                # Usuários — ADMIN (parcial)
│       ├── profile/              # Perfil do usuário (parcial)
│       ├── audit/                # Auditoria — ADMIN (parcial)
│       └── notifications/        # Notificações (parcial)
│
├── lib/
│   └── api/                      # Módulos de integração com a API
│       ├── axios.ts              # Instância Axios + interceptors JWT
│       ├── products.api.ts       # CRUD de produtos + favoritos
│       ├── categories.api.ts     # CRUD de categorias
│       ├── loans.api.ts          # Empréstimos
│       ├── users.api.ts          # Usuários
│       ├── upload.api.ts         # Upload de imagens
│       └── notifications.api.ts  # Notificações
│
├── store/
│   └── auth.store.ts             # Zustand: usuário logado, token, logout
│
├── hooks/
│   ├── useToast.ts               # Hook para exibir Toast da UI-GovPE
│   └── useAuth.ts                # Hook de autenticação
│
├── infrastructure/
│   └── validations/
│       ├── product.ts            # Schema Zod do produto
│       ├── auth.ts               # Schema Zod de login/registro
│       └── ...
│
├── types/
│   └── index.ts                  # Tipos TypeScript globais (Product, User, Loan...)
│
├── proxy.ts                      # Middleware Next.js (proteção de rotas por cookie JWT)
├── next.config.ts                # next.config: remotePatterns para imagens da API
└── .env                          # Variáveis de ambiente
```

---

## Páginas

### Rotas Públicas (`/(auth)`)

| Rota        | Descrição                                          |
|-------------|-----------------------------------------------------|
| `/login`    | Formulário de login — email + senha, retorna JWT   |
| `/register` | Cadastro de novos usuários (role: USER — clientes) |

### Rotas Protegidas (`/(app)`)

| Rota                  | Descrição                                               | Status      |
|-----------------------|---------------------------------------------------------|-------------|
| `/dashboard`          | Cards de resumo: jogos, categorias, empréstimos         | ✅ Completo  |
| `/products`           | Tabela de jogos com busca, filtros, paginação, ações    | ✅ Completo  |
| `/products/new`       | Formulário de cadastro com upload de imagem             | ✅ Completo  |
| `/products/:id`       | Detalhes, imagem, favoritar, solicitar empréstimo       | ✅ Completo  |
| `/products/:id/edit`  | Editar dados e atualizar imagem do jogo                 | ✅ Completo  |
| `/loans`              | Listagem dos empréstimos do usuário                     | ⚠️ Parcial   |
| `/categories`         | CRUD de categorias                                      | ⚠️ Parcial   |
| `/users`              | Gerenciamento de usuários (ADMIN)                       | ⚠️ Parcial   |
| `/profile`            | Editar perfil e avatar                                  | ⚠️ Parcial   |
| `/audit`              | Logs de auditoria (ADMIN)                               | ⚠️ Parcial   |
| `/notifications`      | Central de notificações                                 | ⚠️ Parcial   |

---

## Design System

O projeto utiliza a biblioteca oficial **UI-GovPE** (`@uigovpe/components`), design system do Governo de Pernambuco.

### Componentes utilizados

| Componente       | Uso                                                          |
|------------------|--------------------------------------------------------------|
| `Table` / `Column` | Tabela de listagem de jogos com lazy loading e paginação  |
| `Card`           | Containers de conteúdo (formulários, detalhes)               |
| `Button`         | Ações primárias, secundárias, outlined, danger              |
| `InputText`      | Campos de texto simples                                      |
| `InputTextarea`  | Campo de descrição multilinha                                |
| `InputCurrency`  | Campo de preço com máscara BRL                              |
| `InputFile`      | Upload de imagem com preview e botão de limpar              |
| `MultiSelect`    | Seleção múltipla de categorias                               |
| `Search`         | Campo de busca com autocomplete opcional                    |
| `Filter`         | Filtro por checkbox (status, categorias)                    |
| `Chip`           | Tags removíveis para filtros ativos                          |
| `Tag`            | Badge de status (success/warning/danger)                    |
| `Dialog`         | Modal de confirmação (excluir, solicitar empréstimo)        |
| `Toast`          | Notificações de sucesso/erro                                |
| `Menu`           | Popup de ações contextuais (editar, excluir, detalhar)      |
| `Icon`           | Ícones Material Symbols                                      |
| `FlexContainer`  | Layout flexbox com gap e direção configuráveis              |

---

## Autenticação

### Fluxo

1. Usuário faz login em `/login`
2. API retorna JWT → salvo como cookie `access_token` via `js-cookie`
3. Zustand (`auth.store`) armazena dados do usuário em memória
4. Axios interceptor injeta `Authorization: Bearer <token>` em toda requisição
5. Middleware `proxy.ts` verifica o cookie em cada navegação no servidor

### Proteção de Rotas (Middleware)

O arquivo `proxy.ts` (exportado como `middleware` do Next.js) protege as rotas:

```typescript
// Sem token + rota protegida → redireciona para /login
// Com token + rota de auth → redireciona para /dashboard
```

Configurado para **todas as rotas**, exceto assets estáticos (`_next/static`, `_next/image`, `favicon.ico`).

### Axios — Interceptors

```typescript
// Request: injeta JWT automaticamente
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: token expirado (401) → limpa cookie e redireciona para /login
api.interceptors.response.use(response => response, (error) => {
  if (error.response?.status === 401) {
    Cookies.remove('access_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

---

## API

### Arquivo base (`lib/api/axios.ts`)

Instância Axios pré-configurada com:
- `baseURL`: `NEXT_PUBLIC_API_URL` (http://localhost:3000)
- Interceptor de token JWT
- Interceptor de erro 401

### Upload de Imagens

```typescript
// CORRETO: NÃO passar Content-Type manualmente
// O browser precisa calcular o boundary do multipart automaticamente
const formData = new FormData();
formData.append('file', file);

await api.post(`/upload/product/${id}`, formData, {
  headers: { 'Content-Type': undefined }
});
```

### Imagens da API

O helper `uploadApi.getImageUrl(path)` monta a URL completa:
```typescript
// path = "/uploads/uuid.png" → "http://localhost:3000/uploads/uuid.png"
getImageUrl: (path) => `${NEXT_PUBLIC_API_URL}/${path.replace(/^\//, '')}`
```

O `next.config.ts` autoriza o domínio:
```typescript
images: {
  remotePatterns: [{ protocol: "http", hostname: "localhost", port: "3000", pathname: "/uploads/**" }]
}
```

---

## Implementado

### ✅ Módulo de Autenticação
- Login com email/senha
- Registro de novo usuário (cliente)
- Logout com limpeza de cookie e store
- Proteção de rotas via middleware (proxy.ts)
- Persistência de sessão com cookies

### ✅ Dashboard
- Cards de resumo por papel do usuário
- Atalhos para as principais áreas do sistema
- Layout responsivo com sidebar colapsável

### ✅ Produtos — Listagem (`/products`)
- Tabela com paginação lazy (server-side)
- Busca por título (debounce 300ms)
- Filtro de status via checkbox (`Filter` + `Chip` removíveis)
- Filtro de categorias via checkbox
- Ordenação por coluna (sortable)
- Linhas alternadas (stripedRows)
- Menu de ações por linha (Detalhes / Editar / Excluir)
- Permissão verificada: Editar/Excluir disponível apenas para dono ou ADMIN
- Dialog de confirmação de exclusão

### ✅ Produtos — Cadastro (`/products/new`)
- Formulário completo com validação Zod
- `InputText` para título
- `InputTextarea` para descrição
- `InputCurrency` para preço por dia (máscara BRL)
- `MultiSelect` para categorias (múltipla seleção)
- `InputFile` para capa do jogo (aceita imagens até 5MB)
- Fluxo: cria produto → depois faz upload da imagem separado
- Erros de campo via `supportText` dos inputs

### ✅ Produtos — Detalhes (`/products/:id`)
- Exibe imagem carregada do backend
- Status colorido (Tag: disponível/alugado/manutenção)
- Favoritar/desfavoritar com feedback imediato
- Botão "Pedir Empréstimo" disponível apenas para não-donos + produto disponível
- Dialog de solicitação de empréstimo com campo de data de devolução
- Botão "Editar Jogo" disponível apenas para dono/admin

### ✅ Produtos — Edição (`/products/:id/edit`)
- Pré-carregamento dos dados do produto
- Exibição da imagem atual
- Atualização de todos os campos
- Upload opcional de nova imagem
- Validação e permissões

---

## Pendências

### ⚠️ Empréstimos (`/loans`)
- [ ] Listagem completa com filtros de status
- [ ] Ação de aprovação pelo dono do jogo
- [ ] Ação de registro de devolução
- [ ] Exibição do preço calculado e datas

### ⚠️ Categorias (`/categories`)
- [ ] Formulário de criação de categoria
- [ ] Listagem com opção de editar e excluir
- [ ] Proteção de exclusão (não excluir categorias vinculadas a jogos)

### ⚠️ Usuários — Admin (`/users`)
- [ ] Tabela de todos os usuários (ADMIN only)
- [ ] Alterar role de usuário (USER → ADMIN)
- [ ] Bloquear/desbloquear usuário

### ⚠️ Perfil (`/profile`)
- [ ] Formulário de edição de nome e senha
- [ ] Upload e exibição do avatar via `POST /upload/avatar`

### ⚠️ Auditoria (`/audit`)
- [ ] Tabela paginada de logs de auditoria (ADMIN)
- [ ] Filtros por ação, entidade e período

### ⚠️ Notificações (`/notifications`)
- [ ] Listagem das notificações do usuário
- [ ] Marcar como lida
- [ ] Badge no ícone de notificação (contador)
- [ ] **WebSocket em tempo real** — `socket.io-client` está instalado mas sem listener implementado. Ao conectar, o backend emite `loan:requested`, `loan:approved`, `loan:returned`

```typescript
// Exemplo de como implementar:
import { io } from 'socket.io-client';
const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  auth: { token: Cookies.get('access_token') }
});
socket.on('loan:approved', (data) => {
  showSuccess('Empréstimo aprovado!', data.message);
});
```
