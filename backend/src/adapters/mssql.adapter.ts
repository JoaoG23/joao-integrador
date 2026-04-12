import { Connection, Request } from 'tedious';
import { IDatabaseAdapter } from './database-adapter.interface';

export class MssqlAdapter implements IDatabaseAdapter {
  private static connections = new Map<string, Connection>();
  private connection: Connection;
  private config: any;

  constructor(config: any) {
    this.config = {
      server: config.host,
      authentication: {
        type: 'default',
        options: {
          userName: config.username,
          password: config.password,
        },
      },
      options: {
        port: config.port,
        database: config.databaseName,
        encrypt: true,
        trustServerCertificate: true,
        rowCollectionOnDone: true,
        rowCollectionOnRequestCompletion: true,
      },
    };
  }

  async connect(): Promise<void> {
    const key = this.generateKey(this.config);
    if (MssqlAdapter.connections.has(key)) {
      this.connection = MssqlAdapter.connections.get(key)!;
      // Se a conexão ainda estiver ativa, não fazemos nada
      if ((this.connection as any).state?.name === 'LoggedIn') {
        return;
      }
    }

    return new Promise((resolve, reject) => {
      this.connection = new Connection(this.config);
      this.connection.on('connect', (err) => {
        if (err) {
          MssqlAdapter.connections.delete(key);
          return reject(err);
        }
        MssqlAdapter.connections.set(key, this.connection);
        resolve();
      });

      this.connection.on('error', (err) => {
        console.error('MSSQL Connection Error:', err);
        MssqlAdapter.connections.delete(key);
      });

      this.connection.on('end', () => {
        MssqlAdapter.connections.delete(key);
      });

      this.connection.connect();
    });
  }

  async executeSelect(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const request = new Request(query, (err) => {
        if (err) return reject(err);
        resolve(results);
      });

      request.on('row', (columns) => {
        const row: any = {};
        columns.forEach((column) => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      this.connection.execSql(request);
    });
  }

  async executeCommand(query: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const { transformedQuery, params } = this.transformQuery(query, data);
      const request = new Request(transformedQuery, (err) => {
        if (err) return reject(err);
        resolve();
      });

      params.forEach((p) => {
        request.addParameter(
          p.name,
          (this.connection as any).TYPES.NVarChar,
          p.value,
        );
      });

      this.connection.execSql(request);
    });
  }

  async disconnect(): Promise<void> {
    // No-op: mantemos a conexão aberta para o próximo step
  }

  private generateKey(config: any): string {
    // Usamos o config de autenticação para a chave para simplificar
    return `${config.server}:${config.options.port}:${config.options.database}:${config.authentication.options.userName}`;
  }

  private transformQuery(
    query: string,
    data: any,
  ): { transformedQuery: string; params: { name: string; value: any }[] } {
    const params: { name: string; value: any }[] = [];
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      params.push({ name: key, value: data[key] });
      return `@${key}`;
    });
    return { transformedQuery, params };
  }
}
