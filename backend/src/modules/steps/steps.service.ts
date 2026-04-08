import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class IntegrationStepsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.integrationStep.create({ data });
  }

  async findAllByIntegration(integrationId: number) {
    return this.prisma.integrationStep.findMany({
      where: { integrationId },
      orderBy: { executionOrder: 'asc' },
    });
  }
}
