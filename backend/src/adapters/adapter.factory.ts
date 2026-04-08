import { IDatabaseAdapter } from './database-adapter.interface';
import { PostgresAdapter } from './postgres.adapter';
import { MysqlAdapter } from './mysql.adapter';
import { MssqlAdapter } from './mssql.adapter';

export class AdapterFactory {
  static create(connection: any): IDatabaseAdapter {
    switch (connection.driver.toLowerCase()) {
      case 'postgres':
      case 'postgresql':
        return new PostgresAdapter(connection);
      case 'mysql':
        return new MysqlAdapter(connection);
      case 'mssql':
      case 'sqlserver':
        return new MssqlAdapter(connection);
      default:
        throw new Error(`Driver ${connection.driver} not supported`);
    }
  }
}
