import { Pool } from 'pg';
import { IDatabaseAdapter } from './database-adapter.interface';

export class PostgresAdapter implements IDatabaseAdapter {
  private static pools = new Map<string, Pool>();
  private currentPool: Pool;

  constructor(private config: any) {
    const key = this.generateKey(config);
    if (!PostgresAdapter.pools.has(key)) {
      PostgresAdapter.pools.set(
        key,
        new Pool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.databaseName,
          max: 5,
          idleTimeoutMillis: 30000,
        }),
      );
    }
    this.currentPool = PostgresAdapter.pools.get(key)!;
  }

  async connect(): Promise<void> {
    // No pooling o connect é implícito na primeira query
  }

  async executeSelect(query: string): Promise<any[]> {
    const res = await this.currentPool.query(query);
    return res.rows;
  }

  async executeCommand(query: string, data: any): Promise<void> {
    const { transformedQuery, values } = this.transformQuery(query, data);
    await this.currentPool.query(transformedQuery, values);
  }

  async disconnect(): Promise<void> {
    // No-op: não fechamos o pool para permitir reaproveitamento no próximo step
  }

  private generateKey(config: any): string {
    return `${config.host}:${config.port}:${config.databaseName}:${config.username}`;
  }

  private transformQuery(
    query: string,
    data: any,
  ): { transformedQuery: string; values: any[] } {
    const values: any[] = [];
    let counter = 1;
    const transformedQuery = query.replace(/:(\w+)/g, (_, key) => {
      values.push(data[key]);
      return `$${counter++}`;
    });
    return { transformedQuery, values };
  }
}
