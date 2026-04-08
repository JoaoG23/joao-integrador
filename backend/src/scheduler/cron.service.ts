import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../database/prisma.service';
import { OrchestratorService } from '../modules/orchestrator/orchestrator.service';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private orchestrator: OrchestratorService,
  ) {}

  async onModuleInit() {
    await this.registerAllJobs();
  }

  async registerAllJobs() {
    const integrations = await this.prisma.integration.findMany({
      where: { isActive: true },
    });

    this.logger.log(`Registering ${integrations.length} active integrations`);

    for (const integration of integrations) {
      try {
        this.addCronJob(integration);
      } catch (error) {
        this.logger.error(`Failed to register job for integration ${integration.id}: ${error.message}`);
      }
    }
  }

  addCronJob(integration: any) {
    const job = new CronJob(integration.cronExpression, async () => {
      this.logger.log(`Triggering integration ${integration.id} via cron`);
      await this.orchestrator.runIntegration(integration.id);
    });

    const jobName = `integration_${integration.id}`;
    
    // Check if already exists and delete
    try {
      this.schedulerRegistry.deleteCronJob(jobName);
    } catch (e) {
      // Ignore if doesn't exist
    }

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`Job ${jobName} scheduled with expression: ${integration.cronExpression}`);
  }
}
