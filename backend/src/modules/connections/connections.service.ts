import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdapterFactory } from '../../adapters/adapter.factory';

@Injectable()
export class DatabaseConnectionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.databaseConnection.create({ data });
  }

  async findAll() {
    return this.prisma.databaseConnection.findMany();
  }

  async findOne(id: number) {
    return this.prisma.databaseConnection.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.databaseConnection.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.databaseConnection.delete({
      where: { id },
    });
  }

  async testConnection(config: any) {
    if (!config.driver) return { success: false, message: 'Driver is required' };

    try {
      const adapter = AdapterFactory.create(config);
      await adapter.connect();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }
}
