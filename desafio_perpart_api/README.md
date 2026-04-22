# 🎲 API - Sistema de Aluguel de Jogos de Tabuleiro (PERPART)

## 📌 Contextualização
Esta é a API Backend do desafio técnico da PERPART, desenvolvida para gerenciar um sistema completo de aluguel de jogos de tabuleiro físicos. A aplicação foi desenhada com foco em segurança, escalabilidade e adoção das melhores práticas do mercado, como injeção de dependências, arquitetura modular e RBAC (Role-Based Access Control).

## 🛠️ Tecnologias Utilizadas
A API foi construída com um ecossistema moderno e performático:
- **Node.js** com **NestJS**: Framework progressivo para Node.js, garantindo código estruturado.
- **PostgreSQL**: Banco de dados relacional executado via Docker.
- **Prisma ORM (v7)**: Modelagem de dados simplificada, tipagem segura (Type-safe) e controle de migrações.
- **Socket.IO (WebSockets)**: Para o disparo de notificações e alertas em tempo real.
- **Swagger / OpenAPI**: Documentação automática e interativa de todos os endpoints.
- **Multer**: Processamento eficiente para upload de mídias nativo do Nest.

## 📦 Dependências e Suas Funções
Para garantir a segurança e robustez, instalamos pacotes específicos:
- `@nestjs/jwt` e `passport-jwt`: Responsáveis por emitir e validar os tokens JWT, garantindo sessões seguras e stateless.
- `bcrypt`: Realiza o hash (criptografia irreversível) das senhas dos usuários no banco de dados. Nenhuma senha trafega ou é salva em texto puro.
- `helmet`: Adiciona cabeçalhos HTTP de segurança para proteger a aplicação contra vulnerabilidades web comuns (XSS, Clickjacking, etc).
- `@nestjs/throttler`: Implementa o **Rate Limiting** global (limite de 100 requisições/minuto por IP), blindando a API contra ataques de Força Bruta ou DDoS.
- `@nestjs/schedule` e `cron`: Permitem a execução de tarefas automatizadas em background (cronjobs).
- `class-validator` e `class-transformer`: Aplicam validação restrita em tempo de execução nos DTOs. Requisições com dados malformados são bloqueadas instantaneamente.
- `uuid`: Garante a criação de chaves primárias universais e seguras para evitar previsibilidade de dados.

## 🚀 Estrutura de Módulos e Casos de Uso

A aplicação está dividida nos seguintes módulos lógicos (pastas em `src/`):

1. **Auth & Users**: 
   - Registro público para clientes (Role `USER`).
   - Geração de token JWT no Login.
   - Endpoint `/users/me` para auto-gestão de perfil.
   - Controle de CRUD estrito por parte de Administradores (Role `ADMIN`).

2. **Products & Categories**:
   - Criação de catálogo de jogos de tabuleiro.
   - Sistema dinâmico de **Favoritos** (onde usuários podem guardar os jogos que desejam).
   - Filtros de query na listagem (`search` por título/descrição, filtros de faixa de preço e paginação total).

3. **Uploads**:
   - Upload de imagens para o avatar do usuário e para a foto do produto (jogo).
   - O sistema filtra formatos aceitos (`.png`, `.jpg`, `.webp`) e recusa arquivos maiores que 5MB para proteger o servidor.

4. **Loans (Empréstimos)**:
   - Um locatário solicita um empréstimo fornecendo apenas a data de devolução desejada.
   - A API calcula automaticamente o valor total (dias × preço por dia).
   - O dono do jogo (ou ADMIN) pode aprovar o empréstimo, mudando o status do jogo para `RENTED` (Alugado).
   - **Cronjob Inteligente**: Diariamente, à meia-noite, um script automatizado verifica se há jogos com a devolução atrasada e muda o status do empréstimo para `OVERDUE`.

5. **Notifications (WebSockets)**:
   - Quando um jogo é solicitado, aprovado, devolvido ou se atrasa, a API emite eventos por WebSocket, permitindo que a tela do usuário atualize no frontend em tempo real.
   - Conta também com rotas HTTP para leitura de histórico e "marcar como lida".

6. **Audit (Auditoria Automática)**:
   - Implementado através de um `Interceptor` Global (`audit.interceptor.ts`).
   - Qualquer modificação (`POST`, `PATCH`, `PUT`, `DELETE`) nos módulos acima é silenciosamente interceptada e gravada num histórico de logs com o ID de quem executou a ação e os dados modificados. Ideal para rastreabilidade de sistema em nível empresarial.

## ⚙️ Como Executar a API Localmente

### Pré-requisitos
- Node.js v18 ou superior.
- Docker e Docker Compose instalados.

### 1. Subir o Banco de Dados (PostgreSQL)
Na raiz do projeto (onde está o `docker-compose.yml`), rode:
```bash
docker-compose up -d
```

### 2. Instalar as Dependências e Configurar o Prisma
Na pasta `desafio_perpart_api`:
```bash
npm install
npx prisma db push
```
*(O comando db push sincroniza o schema Prisma gerando as tabelas no seu banco recém criado).*

### 3. Rodar a API
```bash
# Para rodar em modo de desenvolvimento observando as mudanças:
npm run start:dev
```

### 4. Acesso
- **Endpoint Raiz**: `http://localhost:3000`
- **Documentação Swagger (Testes Visuais)**: `http://localhost:3000/api`
- **Prisma Studio (Gerenciador de Banco de Dados)**: Para promover seu usuário a ADMIN, abra outro terminal e digite `npx prisma studio`.
