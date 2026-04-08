import { Connection, Request } from 'tedious';
import { IDatabaseAdapter } from './database-adapter.interface';

export class MssqlAdapter implements IDatabaseAdapter {
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
      },
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection = new Connection(this.config);
      this.connection.on('connect', (err) => {
        if (err) return reject(err);
        resolve();
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
        // This is a simplification. Tedious needs specific types.
        // For a production system, we'd need to map JS types to Tedious types.
        request.addParameter(p.name, (this.connection as any).TYPES.NVarChar, p.value);
      });

      this.connection.execSql(request);
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.close();
    }
  }

  private transformQuery(query: string, data: any): { transformedQuery: string; params: { name: string; value: any }[] } {
    const params: { name: string; value: any }[] = [];
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      params.push({ name: key, value: data[key] });
      return `@${key}`;
    });
    return { transformedQuery, params };
  }
}
