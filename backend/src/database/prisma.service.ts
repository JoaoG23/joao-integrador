import 'dotenv/config'; // Garante o carregamento antecipado das variaveis pro pool do postgres
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // 1. Instancia o Pool do PostgreSQL nativo do Node usando "pg"
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // 2. Instancia o adaptador para o PostgreSQL pro Prisma 7
    const adapter = new PrismaPg(pool);

    // 3. Fornece esse adaptador para o PrismaClientOptions usando o super()
    super({
      adapter,
      log: ['query', 'error'],
    });

    this.pool = pool; // Guarda referência para fechar na destruição do módulo
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    // Garante que a conexão TCP do Pool não vai ficar presa de forma órfã
    await this.pool.end(); 
  }
}