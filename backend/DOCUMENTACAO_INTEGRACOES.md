# Guia de Consultas e Integrações (SQL)

Este documento descreve como configurar as queries de extração (origem) e carga (destino) no sistema de integração.

## 1. Funcionamento Geral

O integrador funciona no modelo **Extract and Load**:
1.  **Origem (Source):** Executa uma query de busca (SELECT).
2.  **Mapeamento:** Os nomes das colunas retornadas no SELECT tornam-se "chaves" (placeholders).
3.  **Destino (Target):** Executa uma query de comando para cada linha retornada, substituindo os placeholders pelos valores da linha.

---

## 2. Tipos de Queries Possíveis

### Origem (`sourceQuery`)
O objetivo aqui é extrair dados. O comando padrão é o **SELECT**.
*   **Exemplo:**
    ```sql
    SELECT id, name, email FROM usuarios_legados
    ```

### Destino (`targetQuery`)
Aqui você define a ação de escrita. Use placeholders com o prefixo `:` seguindo o nome exato da coluna da origem.

#### **INSERT** (Inserir novos dados)
```sql
INSERT INTO tbl_destino (ext_id, nome_completo, email) 
VALUES (:id, :name, :email)
```

#### **UPDATE** (Atualizar dados existentes)
```sql
UPDATE tbl_destino 
SET nome_completo = :name 
WHERE ext_id = :id
```

#### **UPSERT** (Inserir ou Atualizar se já existir)
O comando de UPSERT depende do banco de dados de destino sendo utilizado:

*   **PostgreSQL:**
    ```sql
    INSERT INTO tbl_destino (id, nome) 
    VALUES (:id, :name) 
    ON CONFLICT (id) 
    DO UPDATE SET nome = EXCLUDED.nome
    ```

*   **MySQL:**
    ```sql
    INSERT INTO tbl_destino (id, nome) 
    VALUES (:id, :name) 
    ON DUPLICATE KEY UPDATE nome = VALUES(nome)
    ```

*   **SQL Server (MSSQL):**
    ```sql
    MERGE INTO tbl_destino AS target
    USING (SELECT :id AS id, :name AS nome) AS source
    ON (target.id = source.id)
    WHEN MATCHED THEN
        UPDATE SET target.nome = source.nome
    WHEN NOT MATCHED THEN
        INSERT (id, nome) VALUES (source.id, source.nome);
    ```

---

## 3. Dicas de Performance

*   **Batch Size:** Você pode configurar o `batchSize` no Step para controlar quantos registros são processados por vez. O padrão é 1000.
*   **Aliasing:** Se a coluna na origem tem um nome diferente do que você quer usar no placeholder, use aliases no SQL:
    `SELECT user_full_name AS nome FROM users` -> Use `:nome` no destino.
