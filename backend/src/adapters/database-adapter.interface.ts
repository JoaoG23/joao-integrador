export interface IDatabaseAdapter {
  connect(): Promise<void>;
  executeSelect(query: string): Promise<any[]>;
  executeCommand(query: string, data: any): Promise<void>;
  disconnect(): Promise<void>;
}
