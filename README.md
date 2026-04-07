# 🚀 João Integrador - Integrador de Banco de Dados (ETL)

O **João Integrador** é uma solução robusta e flexível de ETL (Extract, Transform, Load) projetada para facilitar a movimentação e integração de dados entre diferentes motores de banco de dados (PostgreSQL, MySQL e SQL Server).

Este repositório contém tanto o **Backend (NestJS)** quanto o **Frontend (React)** para gerenciar e executar tarefas de integração de forma automatizada e monitorada.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **ORM & Query Builder:** [Prisma](https://www.prisma.io/)
- **Agendamento:** `@nestjs/schedule` (Cron Jobs)
- **Documentação API:** [Swagger](https://swagger.io/)
- **Drivers de DB:** `pg`, `mysql2`, `tedious` (SQL Server)

### **Frontend**

- **Framework:** [React 19](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Gerenciamento de Estado:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Formulários:** `react-hook-form`

---

## 🔄 Como Funciona? (Modelo ETL)

O sistema opera no modelo **Extract and Load** (Extração e Carga), permitindo configurar fluxos entre bancos distintos.

1. **Origem (Source):** Você define uma query SQL de busca (`SELECT`).
2. **Mapeamento Automatizado:** As colunas retornadas no `SELECT` tornam-se "variáveis" dinâmicas.
3. **Destino (Target):** Você define uma query de escrita (`INSERT`, `UPDATE` ou `UPSERT`) usando placeholders com o prefixo `:` (ex: `:id`, `:nome`).

### Exemplo Prático:

**Query de Origem:**

```sql
SELECT id, email, full_name as nome FROM usuarios_antigo
```

**Query de Destino:**

```sql
INSERT INTO tbl_usuarios (ext_id, email, nome_completo) 
VALUES (:id, :email, :nome)
ON CONFLICT (ext_id) DO UPDATE SET email = EXCLUDED.email
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js (v20+)
- Docker (opcional, para instâncias de DB)

### 1. Clonar o Repositório

```bash
git clone https://github.com/JoaoG23/joao-integrador.git
cd joao-integrador
```

### 2. Configurar o Backend

```bash
cd backend
npm install
# Configure o arquivo .env (Database URL, etc)
npx prisma generate
npm run start:dev
```

Acesse a documentação Swagger em: `http://localhost:3000/swagger`

### 3. Configurar o Frontend

```bash
cd ../frontend
npm install
npm run dev
```

O dashboard estará disponível em: `http://localhost:5173`

---

## 📂 Estrutura do Projeto

```text
joao-integrador/
├── backend/          # API NestJS (Lógica de ETL, Prisma, Agendamentos)
├── frontend/         # Dashboard React (Interface de Gestão, Monitoramento)
└── README.md         # Documentação Geral
```

---

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

Feito com ❤️ por João Integrador.
