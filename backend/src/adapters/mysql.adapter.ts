import * as mysql from 'mysql2/promise';
import { IDatabaseAdapter } from './database-adapter.interface';

export class MysqlAdapter implements IDatabaseAdapter {
  private static pools = new Map<string, mysql.Pool>();
  private currentPool: mysql.Pool;

  constructor(private config: any) {
    const key = this.generateKey(config);
    if (!MysqlAdapter.pools.has(key)) {
      MysqlAdapter.pools.set(
        key,
        mysql.createPool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.databaseName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        }),
      );
    }
    this.currentPool = MysqlAdapter.pools.get(key)!;
  }

  async connect(): Promise<void> {
    await this.currentPool.execute('SELECT 1');
  }

  async executeSelect(query: string): Promise<any[]> {
    const [rows] = await this.currentPool.execute(query);
    return rows as any[];
  }

  async executeCommand(query: string, data: any): Promise<void> {
    const { transformedQuery, values } = this.transformQuery(query, data);
    await this.currentPool.execute(transformedQuery, values);
  }

  async disconnect(): Promise<void> {
    // No-op: mantemos o pool para o próximo step
  }

  private generateKey(config: any): string {
    return `${config.host}:${config.port}:${config.databaseName}:${config.username}`;
  }

  private transformQuery(
    query: string,
    data: any,
  ): { transformedQuery: string; values: any[] } {
    const values: any[] = [];
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      values.push(data[key]);
      return '?';
    });
    return { transformedQuery, values };
  }
}
