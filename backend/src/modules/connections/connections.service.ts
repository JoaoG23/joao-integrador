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
}
