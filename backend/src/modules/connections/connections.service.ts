import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
}
