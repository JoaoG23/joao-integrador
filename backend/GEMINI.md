Aqui está a especificação técnica completa do projeto, formatada em **Markdown**, organizada para seguir os princípios de **Clean Architecture** e as necessidades do seu sistema de integração.

---

# Especificação do Projeto: Data Bridge Integrator (NestJS)

## 1. Visão Geral

O projeto consiste em um orquestrador de movimentação de dados entre bancos de dados heterogêneos. O sistema permite cadastrar conexões de diferentes tecnologias (PostgreSQL, MySQL, SQL Server, Oracle, etc.), definir uma pilha de execução de queries (Extração -> Carga) e agendar essas tarefas via Cron Jobs.

## 2. Tecnologias Principais

- **Framework:** NestJS
- **ORM Principal:** Prisma (para gestão das configurações do sistema)
- **Agendamento:** `@nestjs/schedule` (Cron Jobs)
- **Design Pattern:** Adapter (para abstração de drivers de banco de dados) Clean Code, KISS
- **Linguagem:** TypeScript
- Postgres

---

## 3. Arquitetura de Dados (DBML)

Abaixo, a definição das tabelas que gerenciam as integrações.

```dbml
// Cadastro de instâncias de bancos de dados
Table database_connections {
  id String [pk]
  name String
  driver String [note: 'mysql | postgres | mssql']
  host String
  port Int
  username String
  password String
  database_name String
  schema String [default: 'public']
  created_at DateTime [default: `now()`]
}

// Definição do Job de Integração
Table integrations {
  id String [pk]
  name String
  description String
  cron_expression String [note: 'Define a frequência (ex: 0 */2 * * *)']
  is_active Boolean [default: true]
  last_run DateTime
}

// Pilha de execução (Steps)
Table integration_steps {
  id String [pk]
  integration_id String [ref: > integrations.id]

  // Extração
  source_connection_id String [ref: > database_connections.id]
  source_query String [note: 'Query SELECT']

  // Carga
  target_connection_id String [ref: > database_connections.id]
  target_query String [note: 'Query INSERT/UPDATE/UPSERT com placeholders']

  execution_order Int [note: 'Ordem na pilha (1, 2, 3...)']
  batch_size Int [default: 1000]
}
```

---

## 4. Padrão Adapter (Clean Code)

Para garantir que o sistema aceite "todos os bancos", a lógica de conexão é abstraída por uma interface comum.

### Interface do Adaptador

```typescript
export interface IDatabaseAdapter {
  connect(): Promise<void>;
  executeSelect(query: string): Promise<any[]>;
  executeCommand(query: string, data: any): Promise<void>;
  disconnect(): Promise<void>;
}
```

### Fluxo de Execução

1. O **Cron Service** identifica as integrações ativas.
2. O **Orquestrador** lê a `integration_steps` ordenada pelo campo `execution_order`.
3. Para cada step:
   - Instancia o `SourceAdapter` e `TargetAdapter`.
   - Executa a `source_query`.
   - O resultado (array de objetos) é iterado.
   - A `target_query` é executada para cada registro (ou em batch), substituindo os parâmetros.

---

## 5. Requisitos de Implementação

### 5.1. Conexões Dinâmicas

Diferente de um app comum, o Prisma é usado apenas para ler as configurações da aplicação. As conexões de integração devem ser criadas em tempo de execução usando drivers nativos (ex: `pg`, `mysql2`, `tedious`) encapsulados nos Adapters.

Use postgres como banco para integração com prisma ORM é para conceber o sistema

### 5.2. Mapeamento de Queries

As queries de destino devem suportar placeholders nomeados para correlacionar os dados da origem:

- **Exemplo Source:** `SELECT id_antigo as id, nome FROM usuarios`
- **Exemplo Target:** `INSERT INTO users (external_id, full_name) VALUES (:id, :nome)`

### 5.3. Tratamento de Erros e Logs

- Cada execução deve gerar um log na tabela `integration_logs`.
- Em caso de falha no Step 1, a pilha deve decidir (via config) se interrompe ou continua para o Step 2.

---

## 6. Diferenciais do Sistema anterior

- **Flexibilidade:** Não está preso a tabelas fixas; se a query mudar, a integração muda sem deploy.
- **Escalabilidade:** O uso de `batch_size` impede estouro de memória ao processar grandes volumes do sistema legado.
- **Manutenibilidade:** Código desacoplado dos drivers de banco de dados.

---

## 7. Comandos Úteis (Setup)

```bash
# Instalação das dependências de agendamento
npm install --save @nestjs/schedule

# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init_integration_schema
```
