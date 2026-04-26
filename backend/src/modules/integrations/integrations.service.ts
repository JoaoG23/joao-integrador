import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { CronService } from '../../scheduler/cron.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private orchestrator: OrchestratorService,
    private cron: CronService,
  ) {}

  async create(data: any) {
    const integration = await this.prisma.integration.create({ data });
    if (integration.isActive) {
      this.cron.addCronJob(integration);
    }
    return integration;
  }

  async findAll() {
    return this.prisma.integration.findMany({
      include: { steps: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.integration.findUnique({
      where: { id },
      include: {
        steps: true,
        logs: {
          orderBy: {
            startTime: 'desc',
          },
        },
      },
    });
  }

  async update(id: number, data: any) {
    const integration = await this.prisma.integration.update({
      where: { id },
      data,
    });

    if (integration.isActive) {
      this.cron.addCronJob(integration);
    } else {
      this.cron.deleteCronJob(id);
    }

    return integration;
  }

  async remove(id: number) {
    this.cron.deleteCronJob(id);
    return this.prisma.integration.delete({
      where: { id },
    });
  }

  async run(id: number) {
    return this.orchestrator.runIntegration(id);
  }
}
