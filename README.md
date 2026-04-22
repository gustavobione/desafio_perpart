# 🧩 Desafio Técnico PERPART - Fullstack

Este repositório no formato *Monorepo* contém a solução fullstack para o desafio técnico da PERPART, focado na construção de um moderno **Sistema de Aluguel de Jogos de Tabuleiro**.

## 📖 Sobre o Projeto
O projeto foi idealizado para suprir a necessidade de um sistema onde usuários podem se cadastrar, explorar um catálogo digital de jogos de tabuleiro, favoritar os que mais gostam e solicitar empréstimos/aluguéis. A arquitetura suporta administradores e controle estrito de fluxo (aprovação, cálculo financeiro, devolução e auditoria de segurança).

Para manter as responsabilidades separadas e fáceis de escalar, a solução foi dividida em duas grandes frentes:
1. **Backend (API)**: Uma API RESTful robusta e segura construída com NestJS.
2. **Frontend (Web/Mobile)**: A interface responsiva focada no usuário final e construída com diretrizes de *Mobile First* *(Em breve)*.

## 📁 Estrutura do Repositório

```text
/
├── desafio_perpart_api/     # Aplicação Backend (NestJS + Prisma + PostgreSQL)
└── (futuro diretório web)   # Aplicação Frontend
```

## 🚀 Roadmap e Status do Desenvolvimento

### Backend (Fase 1 - Finalizada) ✅
- [x] **Arquitetura Base**: Configuração de banco de dados e ambiente (Docker + PostgreSQL + Prisma ORM 7).
- [x] **Segurança e Proteção**: Implementação de Criptografia de senhas (Bcrypt), Headers de segurança (Helmet), Rate Limiting anti-DDoS e Validação de Inputs.
- [x] **Autenticação**: Geração de tokens JWT e criação do sistema de cargos (Role-Based Access Control - ADMIN vs USER).
- [x] **Core do Negócio**: CRUD de Usuários, CRUD de Produtos (Jogos) e Categorias.
- [x] **Uploads**: Setup de interceptadores nativos (Multer) para receber avatares e capas de produtos com sanitização.
- [x] **Regras Complexas**: Sistema de Empréstimos com cálculo de preços dinâmicos, Cronjobs para varredura de empréstimos em atraso (`OVERDUE`).
- [x] **Auditoria e Observabilidade**: Interceptor global que loga qualquer alteração (`CREATE`, `UPDATE`, `DELETE`) para rastreabilidade; Notificações instantâneas enviadas via WebSockets (Socket.IO).

### Frontend (Fase 2 - Pendente) ⏳
- [ ] **Estruturação do Projeto**: Setup do framework web (React/Next.js/Angular/etc).
- [ ] **Design System UI-GovPE**: Adesão aos padrões de interface solicitados e adequação responsiva (Mobile First).
- [ ] **Integração com a API**: Consumo seguro dos endpoints REST criados na Fase 1.
- [ ] **WebSockets**: Ouvinte de eventos no lado do cliente para mostrar notificações ao vivo na tela.

## 🔗 Navegação
- 👉 [Ir para a documentação detalhada da API Backend](./desafio_perpart_api/README.md)
