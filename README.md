# 🎲 Desafio Técnico PERPART — Sistema de Aluguel de Jogos de Tabuleiro

> **Monorepo Fullstack** — NestJS (Backend) + Next.js 16 (Frontend) + PostgreSQL

---

## 📖 Sobre o Projeto

Sistema web completo para gerenciamento de aluguel de jogos de tabuleiro. Usuários podem se cadastrar, explorar o catálogo de jogos, favoritar e solicitar empréstimos. Administradores gerenciam o acervo, aprovam solicitações e monitoram o sistema com logs de auditoria em tempo real.

---

## 📁 Estrutura do Monorepo

```
desafio_perpart/
├── desafio_perpart_api/     # Backend — NestJS + Prisma + PostgreSQL
├── desafio_perpart_app/     # Frontend — Next.js 16 + UI-GovPE
├── docker-compose.yml       # Banco de dados PostgreSQL via Docker
└── README.md
```

---

## 🛠️ Stack Tecnológica

| Camada       | Tecnologia                                                  |
|--------------|-------------------------------------------------------------|
| Backend      | NestJS 11, Prisma 7 ORM, PostgreSQL, Passport JWT, Socket.io |
| Frontend     | Next.js 16, React 19, Zustand, Axios, Zod, Socket.io-client |
| Design System| UI-GovPE (`@uigovpe/components` + `@uigovpe/styles`)        |
| Banco de Dados | PostgreSQL 15 (Docker)                                    |
| Segurança    | Helmet, Bcrypt, JWT, Rate Limiting (Throttler), CORS         |
| Uploads      | Multer (multipart/form-data), Express Static Assets          |

---

## ⚙️ Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) `>= 20.x`
- [npm](https://www.npmjs.com/) `>= 10.x`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)
- [Git](https://git-scm.com/)

---

## 🚀 Instalação e Execução Completa

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITÓRIO>
cd desafio_perpart
```

### 2. Subir o banco de dados (Docker)

```bash
docker-compose up -d
```

Isso cria e inicia um container PostgreSQL com:
- **Host:** `localhost`
- **Porta:** `5432`
- **Banco:** `perpart_db`
- **Usuário:** `admin`
- **Senha:** `admin123`

> ✅ O container se chama `perpart_db`. Verifique com `docker ps`.

---

### 3. Configurar e iniciar o Backend (API)

```bash
cd desafio_perpart_api
```

#### 3.1 Instalar dependências

```bash
npm install
```

#### 3.2 Criar o arquivo `.env`

Crie o arquivo `desafio_perpart_api/.env` com o seguinte conteúdo:

```env
# ==========================================
# BANCO DE DADOS (PostgreSQL)
# ==========================================
DATABASE_URL="postgresql://admin:admin123@localhost:5432/perpart_db?schema=public"

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=perpart_db

# ==========================================
# URLS
# ==========================================
API_URL="http://localhost:3000"
APP_URL="http://localhost:3001"

# ==========================================
# JWT
# ==========================================
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000

# ==========================================
# ADMIN INICIAL (seed automático ao iniciar)
# ==========================================
INITIAL_ADMIN_USER="ADMIN"
INITIAL_ADMIN_EMAIL="admin@gmail.com"
INITIAL_ADMIN_PASSWORD="Password123#"
```

> 🔐 **Importante:** Na primeira execução, o sistema cria automaticamente o usuário administrador com as credenciais definidas acima. Novos ADMINs só podem ser criados por um ADMIN logado.

#### 3.3 Executar as migrations e gerar o banco

```bash
npx prisma migrate dev --name init
```

> Se o banco já existir com dados, use `npx prisma db push` para sincronizar sem apagar dados.

#### 3.4 Iniciar o servidor de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em: **http://localhost:3000**
Documentação Swagger: **http://localhost:3000/api**

---

### 4. Configurar e iniciar o Frontend (App)

Em um **novo terminal:**

```bash
cd desafio_perpart_app
```

#### 4.1 Instalar dependências

```bash
npm install
```

#### 4.2 Criar o arquivo `.env`

Crie o arquivo `desafio_perpart_app/.env` com o seguinte conteúdo:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

#### 4.3 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O app estará disponível em: **http://localhost:3001**

---

## 🔑 Credenciais de Acesso (Padrão)

| Tipo    | Email                | Senha         |
|---------|----------------------|---------------|
| Admin   | `admin@gmail.com`    | `Password123#`|
| Usuário | Registrar em `/register` | — |

> O Admin é criado automaticamente ao iniciar a API pela primeira vez. Apenas ADMINs podem criar outros ADMINs (via painel de usuários).

---

## 🗂️ Endpoints da API — Resumo

Todos os endpoints (exceto login/registro) requerem `Authorization: Bearer <token>`.

| Método | Rota                        | Descrição                              |
|--------|-----------------------------|----------------------------------------|
| POST   | `/auth/login`               | Login (retorna JWT)                    |
| POST   | `/auth/register`            | Registro de novo usuário (role: USER)  |
| GET    | `/products`                 | Listar jogos (filtros + paginação)     |
| POST   | `/products`                 | Cadastrar novo jogo (autenticado)      |
| GET    | `/products/:id`             | Detalhe de um jogo                     |
| PATCH  | `/products/:id`             | Editar jogo (dono ou ADMIN)            |
| DELETE | `/products/:id`             | Remover jogo (dono ou ADMIN)           |
| POST   | `/products/:id/favorite`    | Favoritar jogo                         |
| DELETE | `/products/:id/favorite`    | Desfavoritar jogo                      |
| GET    | `/products/favorites`       | Listar meus favoritos                  |
| POST   | `/upload/product/:id`       | Upload de capa do jogo (multipart)     |
| POST   | `/upload/avatar`            | Upload de avatar do usuário            |
| GET    | `/categories`               | Listar categorias                      |
| POST   | `/categories`               | Criar categoria (autenticado)          |
| GET    | `/loans`                    | Listar empréstimos                     |
| POST   | `/loans`                    | Solicitar empréstimo                   |
| PATCH  | `/loans/:id/approve`        | Aprovar empréstimo (dono do jogo)      |
| PATCH  | `/loans/:id/return`         | Registrar devolução                    |
| GET    | `/users`                    | Listar usuários (ADMIN)                |
| GET    | `/users/me`                 | Dados do perfil autenticado            |
| PATCH  | `/users/:id`                | Atualizar usuário                      |
| GET    | `/audit`                    | Logs de auditoria (ADMIN)              |
| GET    | `/notifications`            | Notificações do usuário                |

> 📖 Documentação completa e interativa: **http://localhost:3000/api** (Swagger UI)

---

## 🌐 Páginas do Frontend

| Rota                    | Descrição                                       | Status     |
|-------------------------|-------------------------------------------------|------------|
| `/login`                | Tela de login                                   | ✅ Completo |
| `/register`             | Cadastro de novo usuário (clientes)             | ✅ Completo |
| `/dashboard`            | Painel inicial (cards de resumo por papel)      | ✅ Completo |
| `/products`             | Listagem de jogos com filtros, busca e paginação| ✅ Completo |
| `/products/new`         | Formulário de cadastro de jogo + upload de capa | ✅ Completo |
| `/products/:id`         | Detalhes do jogo (favoritar, solicitar emp.)    | ✅ Completo |
| `/products/:id/edit`    | Formulário de edição do jogo                    | ✅ Completo |
| `/loans`                | Listagem de empréstimos do usuário              | ⚠️ Parcial  |
| `/categories`           | Gerenciamento de categorias (ADMIN)             | ⚠️ Parcial  |
| `/users`                | Gerenciamento de usuários (ADMIN)               | ⚠️ Parcial  |
| `/profile`              | Edição do perfil e upload de avatar             | ⚠️ Parcial  |
| `/audit`                | Logs de auditoria (ADMIN)                       | ⚠️ Parcial  |
| `/notifications`        | Central de notificações                         | ⚠️ Parcial  |

---

## ✅ Funcionalidades Implementadas

### Backend (100% completo)

- [x] **Autenticação JWT** — Login, registro, tokens com expiração configurável
- [x] **RBAC** — Controle de acesso por papel (ADMIN / USER)
- [x] **Seed automático** — Admin inicial criado via `.env` na primeira execução
- [x] **CRUD de Produtos** — Criação, edição, remoção com verificação de permissão por dono/admin
- [x] **CRUD de Categorias** — Vinculação N:M com produtos
- [x] **CRUD de Usuários** — Perfil, avatar, gerenciamento admin
- [x] **Sistema de Empréstimos** — Solicitação, aprovação, devolução, cálculo de preço dinâmico (`pricePerDay × dias`)
- [x] **Status de atraso (OVERDUE)** — Cronjob automático que detecta empréstimos atrasados
- [x] **Sistema de Favoritos** — Adicionar/remover, listar por usuário
- [x] **Upload de Arquivos** — Multer com sanitização; capa de produto e avatar de usuário
- [x] **Servir arquivos estáticos** — `/uploads/*` público via Express Static Assets
- [x] **Auditoria global** — Interceptor que loga CREATE/UPDATE/DELETE com dados antes/depois
- [x] **Notificações em tempo real** — WebSockets (Socket.io) para eventos de empréstimo
- [x] **Documentação Swagger** — Todos os endpoints documentados com exemplos
- [x] **Segurança** — Helmet, CORS, Rate Limiting (Throttler), Bcrypt, ValidationPipe com whitelist

### Frontend (módulo de produtos completo)

- [x] **Autenticação completa** — Login, registro, proteção de rotas via middleware, logout
- [x] **Persistência de sessão** — Token JWT em cookie (`js-cookie`) + Zustand store
- [x] **Dashboard** — Cards dinâmicos conforme papel do usuário (ADMIN vs USER)
- [x] **Design System UI-GovPE** — Tabela, formulários, diálogos, filtros, chips, tags, ícones
- [x] **Listagem de jogos** — Tabela paginada com lazy loading, busca textual, filtro de status (checkbox), filtro de categorias, ordenação por coluna, menu de ações contextual
- [x] **Cadastro de jogo** — Formulário com validação Zod, upload de imagem separado do cadastro, `InputCurrency`, `MultiSelect`, `InputTextarea`, `InputFile`
- [x] **Edição de jogo** — Pré-carregamento dos dados, atualização e upload de nova imagem, permissão validada
- [x] **Detalhes do jogo** — Exibição da imagem carregada do backend, favoritar, solicitar empréstimo via dialog, botão de edição condicional por permissão
- [x] **Exibição de imagens** — Corrigido Helmet CORS (`cross-origin`), `useStaticAssets` e `remotePatterns` no `next.config.ts`

---

## ⚠️ O que ficou pendente no Frontend

| Módulo         | Pendência                                                                |
|----------------|--------------------------------------------------------------------------|
| **Empréstimos** | Página `/loans` criada mas sem integração completa com API (listar, filtrar, aprovar, devolver) |
| **Categorias** | Página `/categories` sem CRUD completo via interface                      |
| **Usuários**   | Página `/users` (ADMIN) sem listagem, edição de papel e bloqueio         |
| **Perfil**     | Página `/profile` sem upload de avatar funcional via interface           |
| **Auditoria**  | Página `/audit` sem tabela conectada ao endpoint `/audit`                |
| **Notificações**| Painel `/notifications` criado, sem leitura em tempo real via WebSocket  |
| **WebSocket**  | `socket.io-client` instalado mas sem listener implementado no frontend   |
| **Aprovação**  | Fluxo de aprovação de empréstimo pelo dono do jogo sem tela dedicada     |

---

## 🗄️ Modelo de Dados (Banco)

```
User ──────── Product (1:N — um usuário cadastra N jogos)
User ──────── Loan    (1:N — um usuário faz N empréstimos)
User ──────── Notification (1:N)
User ──────── AuditLog (1:N)
User ◄──────► Product (N:M — favoritos)
Product ◄───► Category (N:M — categorias)
Product ──── Loan (1:N — um jogo tem N histórico de empréstimos)
```

**Enums:**
- `Role`: `USER` | `ADMIN`
- `ProductStatus`: `AVAILABLE` | `RENTED` | `MAINTENANCE`
- `LoanStatus`: `REQUESTED` | `ACTIVE` | `RETURNED` | `OVERDUE`
- `NotificationType`: `LOAN_REQUEST` | `LOAN_APPROVED` | `LOAN_RETURNED` | `FAVORITE_ALERT` | `SYSTEM`

---

## 🔒 Regras de Negócio

1. **Registro público** cria apenas usuários com `role: USER`. Novos `ADMIN` só podem ser criados por um ADMIN autenticado.
2. **Editar/excluir produto** — apenas o **dono** (`ownerId`) ou um **ADMIN**.
3. **Solicitar empréstimo** — apenas usuários que **não são donos** do jogo e que ele esteja `AVAILABLE`.
4. **Aprovar empréstimo** — apenas o **dono do jogo**.
5. **Preço total** é calculado automaticamente: `pricePerDay × número de dias até devolução`.
6. **Status OVERDUE** é atualizado por um **CronJob** diário que verifica `expectedReturnDate < hoje`.
7. **Auditoria** registra automaticamente qualquer mutação via interceptor global.

---

## 📸 Arquivos de Upload

- Salvos em: `desafio_perpart_api/uploads/`
- Acessíveis via: `http://localhost:3000/uploads/<nome-do-arquivo>`
- Formatos aceitos: `jpg`, `jpeg`, `png`, `webp`
- Tamanho máximo: `5MB`

> ⚠️ A pasta `uploads/` está no `.gitignore` — não é versionada.

---

## 📂 Estrutura Detalhada do Backend

```
desafio_perpart_api/
├── prisma/
│   ├── schema.prisma          # Modelos de dados
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── auth/                  # Autenticação JWT, Guards, Decorators
│   ├── users/                 # CRUD de usuários + seed do admin
│   ├── products/              # CRUD de jogos + favoritos
│   ├── categories/            # CRUD de categorias
│   ├── loans/                 # Sistema de empréstimos + CronJob OVERDUE
│   ├── upload/                # Upload de imagens (Multer + config)
│   ├── notifications/         # WebSocket Gateway + CRUD de notificações
│   ├── audit/                 # Interceptor global + listagem de logs
│   ├── prisma/                # PrismaService (singleton)
│   ├── types/                 # Tipos compartilhados (JwtPayload, etc.)
│   └── main.ts                # Bootstrap, Helmet, CORS, Swagger, Static Assets
├── uploads/                   # Arquivos enviados (não versionado)
├── .env                       # Variáveis de ambiente (não versionado)
└── docker-compose.yml
```

## 📂 Estrutura Detalhada do Frontend

```
desafio_perpart_app/
├── app/
│   ├── (auth)/                # Rotas públicas: /login, /register
│   └── (app)/                 # Rotas protegidas (middleware de auth)
│       ├── layout.tsx         # Layout principal com sidebar e navbar
│       ├── dashboard/         # Página inicial com cards de resumo
│       ├── products/          # Listagem, detalhes, cadastro, edição
│       ├── loans/             # Empréstimos (parcial)
│       ├── categories/        # Categorias (parcial)
│       ├── users/             # Usuários admin (parcial)
│       ├── profile/           # Perfil do usuário (parcial)
│       ├── audit/             # Auditoria (parcial)
│       └── notifications/     # Notificações (parcial)
├── lib/
│   └── api/                   # Módulos Axios: products, loans, users, upload, etc.
├── store/                     # Zustand (auth.store)
├── hooks/                     # useToast, useAuth
├── infrastructure/
│   └── validations/           # Schemas Zod
├── types/                     # Tipagens TypeScript globais
├── proxy.ts                   # Middleware Next.js (proteção de rotas)
├── next.config.ts             # Configuração Next.js (remotePatterns para imagens)
└── .env                       # Variáveis públicas do Next.js
```

---

## 🧑‍💻 Autor

**Gustavo Tbione**
Desenvolvido como Desafio Técnico para a **PERPART — Pernambuco Participações e Investimentos S.A.**
