import { Client } from 'pg';
import { IDatabaseAdapter } from './database-adapter.interface';

export class PostgresAdapter implements IDatabaseAdapter {
  private client: Client;

  constructor(private config: any) {
    this.client = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.databaseName,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    if (this.config.schema) {
      await this.client.query(`SET search_path TO ${this.config.schema}`);
    }
  }

  async executeSelect(query: string): Promise<any[]> {
    const res = await this.client.query(query);
    return res.rows;
  }

  async executeCommand(query: string, data: any): Promise<void> {

    const { transformedQuery, values } = this.transformQuery(query, data);
    await this.client.query(transformedQuery, values);
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  private transformQuery(query: string, data: any): { transformedQuery: string; values: any[] } {
    const values: any[] = [];
    let counter = 1;
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      values.push(data[key]);
      return `$${counter++}`;
    });
    return { transformedQuery, values };
  }
}
