# 🎲 Desafio Perpart — API Backend

> **NestJS 11 + Prisma 7 + PostgreSQL**
> API RESTful completa para o Sistema de Aluguel de Jogos de Tabuleiro.

---

## 📋 Índice

- [Stack e Dependências](#stack)
- [Configuração do Ambiente (.env)](#env)
- [Instalação e Execução](#instalação)
- [Banco de Dados e Migrações](#banco)
- [Módulos da API](#módulos)
- [Endpoints Completos](#endpoints)
- [Segurança](#segurança)
- [WebSockets](#websockets)
- [Auditoria](#auditoria)
- [Upload de Arquivos](#upload)

---

## Stack

| Pacote                        | Versão   | Uso                                      |
|-------------------------------|----------|------------------------------------------|
| `@nestjs/common`              | ^11      | Framework base                           |
| `@nestjs/platform-express`    | ^11      | Integração Express                       |
| `@nestjs/jwt` + `passport-jwt`| ^11      | Autenticação JWT                         |
| `@prisma/client`              | ^7       | ORM e queries ao banco                   |
| `prisma`                      | ^7       | CLI de migrations e geração de client    |
| `bcrypt`                      | ^6       | Hash de senhas                           |
| `helmet`                      | ^8       | Headers HTTP de segurança                |
| `@nestjs/throttler`           | ^6       | Rate Limiting anti-DDoS                  |
| `@nestjs/swagger`             | ^11      | Documentação automática (OpenAPI)        |
| `@nestjs/schedule`            | ^6       | Cronjob para empréstimos OVERDUE         |
| `@nestjs/websockets`          | ^11      | Gateway WebSocket (Socket.io)            |
| `class-validator`             | ^0.15    | Validação de DTOs                        |
| `class-transformer`           | ^0.5     | Transformação de tipos (e.g. string→number)|
| `multer`                      | (built-in)| Upload de arquivos multipart            |

---

## Env

Crie o arquivo `.env` na raiz de `desafio_perpart_api/`:

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
CORS_ORIGIN="http://localhost:3001"

# ==========================================
# JWT
# ==========================================
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000

# ==========================================
# ADMIN INICIAL — Seed automático na 1ª inicialização
# A senha deve ter: mínimo 6 chars, 1 maiúscula, 1 minúscula,
# 1 número e 1 caractere especial
# ==========================================
INITIAL_ADMIN_USER="ADMIN"
INITIAL_ADMIN_EMAIL="admin@gmail.com"
INITIAL_ADMIN_PASSWORD="Password123#"
```

---

## Instalação

### 1. Subir o banco de dados (Docker)

Na raiz do monorepo (`/desafio_perpart`):

```bash
docker-compose up -d
```

### 2. Instalar dependências

```bash
cd desafio_perpart_api
npm install
```

### 3. Executar as migrations

```bash
npx prisma migrate dev --name init
```

> Se o banco já existe e você quer apenas sincronizar sem apagar dados:
> ```bash
> npx prisma db push
> ```

### 4. Iniciar em desenvolvimento

```bash
npm run start:dev
```

### Scripts disponíveis

```bash
npm run start:dev    # Hot reload (desenvolvimento)
npm run start:prod   # Produção (requer build)
npm run build        # Compilar TypeScript → dist/
npm run lint         # ESLint com auto-fix
npm run test         # Testes unitários (Jest)
npm run test:e2e     # Testes end-to-end
```

---

## Banco

### Banco de Dados

- **Provider:** PostgreSQL 15 (via Docker)
- **ORM:** Prisma 7 com adapter `pg`
- **Container:** `perpart_db` (porta `5432`)

### Modelos do Schema

| Model          | Campos principais                                                  |
|----------------|--------------------------------------------------------------------|
| `User`         | `id`, `name`, `email`, `password`, `role`, `avatarUrl`            |
| `Product`      | `id`, `title`, `description`, `imageUrl`, `pricePerDay`, `status` |
| `Category`     | `id`, `name`, `creatorId`                                          |
| `Loan`         | `id`, `startDate`, `expectedReturnDate`, `totalPrice`, `status`   |
| `Notification` | `id`, `content`, `read`, `type`, `userId`                         |
| `AuditLog`     | `id`, `action`, `entity`, `entityId`, `details`, `userId`         |

### Enums

```typescript
Role:            USER | ADMIN
ProductStatus:   AVAILABLE | RENTED | MAINTENANCE
LoanStatus:      REQUESTED | ACTIVE | RETURNED | OVERDUE
NotificationType: LOAN_REQUEST | LOAN_APPROVED | LOAN_RETURNED | FAVORITE_ALERT | SYSTEM
```

### Relacionamentos principais

```
User 1:N Product     (um usuário cadastra vários jogos)
User N:M Product     (favoritos — via @relation("UserFavorites"))
User 1:N Loan        (usuário locatário)
Product 1:N Loan
Product N:M Category
User 1:N Notification
User 1:N AuditLog
```

---

## Módulos

### `auth` — Autenticação
- **Login** via email/senha, retorna JWT
- **Registro** cria usuários com `role: USER` (clientes)
- Guard `JwtAuthGuard` protege todas as rotas autenticadas
- Decorator `@CurrentUser()` injeta `userId` e `role` nos controllers

### `users` — Usuários
- Seed automático do admin na inicialização via `onModuleInit`
- CRUD completo de usuários
- Listagem exclusiva para ADMIN (`/users` requer role ADMIN)
- Upload de avatar integrado

### `products` — Jogos de Tabuleiro
- CRUD completo com paginação e filtros avançados
- Filtros: busca por texto, categoria, status, faixa de preço
- Permissão por ownership: apenas dono ou ADMIN pode editar/excluir
- Sistema de favoritos (N:M com User)

### `categories` — Categorias
- CRUD de categorias vinculadas a produtos (N:M)
- Qualquer usuário autenticado pode criar categorias

### `loans` — Empréstimos
- Solicitar empréstimo (`REQUESTED`)
- Dono do jogo aprova → status vira `ACTIVE`, produto vira `RENTED`
- Devolução registrada → status vira `RETURNED`, produto volta a `AVAILABLE`
- Cálculo automático de `totalPrice = pricePerDay × dias`
- **CronJob diário** (`@Cron`) verifica empréstimos com `expectedReturnDate` expirada e muda para `OVERDUE`

### `upload` — Arquivos
- Upload de capa do produto: `POST /upload/product/:id`
- Upload de avatar: `POST /upload/avatar`
- Arquivos salvos em `./uploads/` (UUID + extensão original)
- Configuração Multer com filtro de tipo e limite de 5MB
- Servido como estático via `useStaticAssets` em `main.ts`

### `notifications` — Notificações
- Criadas automaticamente ao aprovar/devolver empréstimos
- Listagem das notificações do usuário autenticado
- Marcar como lida

### `audit` — Auditoria
- Interceptor global que captura qualquer `POST`, `PATCH`, `PUT`, `DELETE`
- Salva: `action`, `entity`, `entityId`, `details` (before/after), `userId`
- Listagem dos logs (ADMIN)

---

## Endpoints

### Autenticação

| Método | Rota              | Auth | Descrição           |
|--------|-------------------|------|---------------------|
| POST   | `/auth/login`     | ❌   | Login (retorna JWT) |
| POST   | `/auth/register`  | ❌   | Registro de usuário |

### Produtos

| Método | Rota                        | Auth | Permissão | Descrição                  |
|--------|-----------------------------|------|-----------|----------------------------|
| GET    | `/products`                 | ✅   | Todos     | Listar (filtros + paginação)|
| POST   | `/products`                 | ✅   | Todos     | Cadastrar novo jogo         |
| GET    | `/products/favorites`       | ✅   | Todos     | Meus favoritos             |
| GET    | `/products/:id`             | ✅   | Todos     | Detalhe do jogo            |
| PATCH  | `/products/:id`             | ✅   | Dono/Admin| Editar jogo                |
| DELETE | `/products/:id`             | ✅   | Dono/Admin| Excluir jogo               |
| POST   | `/products/:id/favorite`    | ✅   | Todos     | Favoritar                  |
| DELETE | `/products/:id/favorite`    | ✅   | Todos     | Desfavoritar               |

**Query params do `GET /products`:**
```
?search=catan       # busca no título/descrição
&status=AVAILABLE   # AVAILABLE | RENTED | MAINTENANCE
&categoryId=uuid    # filtra por categoria
&minPrice=10        # preço mínimo por dia
&maxPrice=100       # preço máximo por dia
&page=1             # página (padrão: 1)
&limit=10           # itens por página (padrão: 10)
```

### Categorias

| Método | Rota              | Auth | Descrição         |
|--------|-------------------|------|-------------------|
| GET    | `/categories`     | ✅   | Listar categorias |
| POST   | `/categories`     | ✅   | Criar categoria   |
| PATCH  | `/categories/:id` | ✅   | Editar categoria  |
| DELETE | `/categories/:id` | ✅   | Remover categoria |

### Empréstimos

| Método | Rota                    | Auth | Descrição                           |
|--------|-------------------------|------|-------------------------------------|
| GET    | `/loans`                | ✅   | Listar empréstimos do usuário        |
| POST   | `/loans`                | ✅   | Solicitar empréstimo                |
| GET    | `/loans/:id`            | ✅   | Detalhe do empréstimo               |
| PATCH  | `/loans/:id/approve`    | ✅   | Aprovar (dono do jogo)              |
| PATCH  | `/loans/:id/return`     | ✅   | Registrar devolução                 |

### Usuários

| Método | Rota         | Auth | Permissão | Descrição            |
|--------|--------------|------|-----------|----------------------|
| GET    | `/users`     | ✅   | ADMIN     | Listar usuários      |
| GET    | `/users/me`  | ✅   | Todos     | Meu perfil           |
| GET    | `/users/:id` | ✅   | ADMIN     | Buscar por ID        |
| PATCH  | `/users/:id` | ✅   | Dono/Admin| Editar usuário       |
| DELETE | `/users/:id` | ✅   | ADMIN     | Remover usuário      |

### Upload

| Método | Rota                   | Auth | Content-Type        | Descrição            |
|--------|------------------------|------|---------------------|----------------------|
| POST   | `/upload/product/:id`  | ✅   | multipart/form-data | Capa do produto      |
| POST   | `/upload/avatar`       | ✅   | multipart/form-data | Avatar do usuário    |

**Form field:** `file` (campo obrigatório no FormData)

### Notificações

| Método | Rota                      | Auth | Descrição              |
|--------|---------------------------|------|------------------------|
| GET    | `/notifications`          | ✅   | Listar notificações    |
| PATCH  | `/notifications/:id/read` | ✅   | Marcar como lida       |

### Auditoria

| Método | Rota     | Auth | Permissão | Descrição            |
|--------|----------|------|-----------|----------------------|
| GET    | `/audit` | ✅   | ADMIN     | Listar logs          |

---

## Segurança

| Mecanismo         | Implementação                                              |
|-------------------|------------------------------------------------------------|
| Senhas            | `bcrypt` com salt rounds padrão                           |
| Autenticação      | JWT via `passport-jwt`, token em `Authorization: Bearer`  |
| Headers HTTP      | `helmet` com `crossOriginResourcePolicy: cross-origin`    |
| Rate Limiting     | `@nestjs/throttler` — limite de requisições por IP        |
| Validação de DTO  | `class-validator` + `ValidationPipe` (whitelist + forbid) |
| CORS              | Configurado para `APP_URL` (localhost:3001 por padrão)    |

---

## WebSockets

Gateway Socket.io disponível no mesmo servidor na porta `3000`.

**Eventos emitidos pelo servidor:**
- `loan:requested` — Nova solicitação de empréstimo ao dono do jogo
- `loan:approved` — Empréstimo aprovado (notifica locatário)
- `loan:returned` — Devolução registrada

**Conectar no cliente:**
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', {
  auth: { token: '<JWT_TOKEN>' }
});
socket.on('loan:approved', (data) => console.log(data));
```

---

## Upload

### Multer Config (`multer.config.ts`)

- **Destino:** `./uploads/`
- **Filename:** `{uuid}.{ext_original}`
- **Filtro:** apenas `image/jpeg`, `image/png`, `image/webp`
- **Limite:** 5MB por arquivo

### Como fazer upload via frontend (Axios)

```typescript
const formData = new FormData();
formData.append('file', file); // File object

// NÃO setar Content-Type manualmente!
// O axios/browser calcula o boundary automaticamente com FormData
await axios.post(`/upload/product/${productId}`, formData, {
  headers: { 'Content-Type': undefined }
});
```

---

## Documentação Swagger

Disponível em: **http://localhost:3000/api**

Inclui autenticação Bearer integrada — clique em **Authorize** e insira o token JWT retornado pelo login.
