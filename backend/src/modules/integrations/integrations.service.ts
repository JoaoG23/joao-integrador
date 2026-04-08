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
      include: { steps: true, logs: true },
    });
  }

  async run(id: number) {
    return this.orchestrator.runIntegration(id);
  }
}
