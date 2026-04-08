import * as mysql from 'mysql2/promise';
import { IDatabaseAdapter } from './database-adapter.interface';

export class MysqlAdapter implements IDatabaseAdapter {
  private connection: mysql.Connection;

  constructor(private config: any) {
  }

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.databaseName,
    });
  }

  async executeSelect(query: string): Promise<any[]> {
    const [rows] = await this.connection.execute(query);
    return rows as any[];
  }

  async executeCommand(query: string, data: any): Promise<void> {
    const { transformedQuery, values } = this.transformQuery(query, data);
    await this.connection.execute(transformedQuery, values);
  }

  async disconnect(): Promise<void> {
    await this.connection.end();
  }

  private transformQuery(query: string, data: any): { transformedQuery: string; values: any[] } {
    const values: any[] = [];
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      values.push(data[key]);
      return '?';
    });
    return { transformedQuery, values };
  }
}
