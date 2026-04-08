import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdapterFactory } from '../../adapters/adapter.factory';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(private prisma: PrismaService) {}

  async runIntegration(integrationId: number): Promise<void> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
      include: {
        steps: {
          orderBy: { executionOrder: 'asc' },
          include: {
            sourceConnection: true,
            targetConnection: true,
          },
        },
      },
    });

    if (!integration || !integration.isActive) {
      this.logger.warn(`Integration ${integrationId} not found or inactive`);
      return;
    }

    const startTime = new Date();
    this.logger.log(`Starting integration ${integration.name} (${integrationId})`);

    try {
      for (const step of integration.steps) {
        this.logger.log(`Executing step ${step.executionOrder} of integration ${integrationId}`);
        await this.executeStep(step);
      }

      await this.prisma.integration.update({
        where: { id: integrationId },
        data: { lastRun: new Date() },
      });

      await this.prisma.integrationLog.create({
        data: {
          integrationId,
          status: 'SUCCESS',
          startTime,
          endTime: new Date(),
          message: 'Integration completed successfully',
        },
      });

      this.logger.log(`Integration ${integrationId} completed successfully`);
    } catch (error) {
      this.logger.error(`Integration ${integrationId} failed: ${error.message}`);
      
      await this.prisma.integrationLog.create({
        data: {
          integrationId,
          status: 'FAILURE',
          startTime,
          endTime: new Date(),
          message: error.message,
        },
      });
    }
  }

  private async executeStep(step: any): Promise<void> {
    const sourceAdapter = AdapterFactory.create(step.sourceConnection);
    const targetAdapter = AdapterFactory.create(step.targetConnection);

    try {
      await sourceAdapter.connect();
      await targetAdapter.connect();

      const results = await sourceAdapter.executeSelect(step.sourceQuery);
      this.logger.log(`Extracted ${results.length} rows from source`);

      for (let i = 0; i < results.length; i += step.batchSize) {
        const batch = results.slice(i, i + step.batchSize);
        for (const row of batch) {
          await targetAdapter.executeCommand(step.targetQuery, row);
        }
        this.logger.log(`Processed batch ${i / step.batchSize + 1}`);
      }
    } finally {
      await sourceAdapter.disconnect().catch(err => this.logger.error(`Error disconnecting source: ${err.message}`));
      await targetAdapter.disconnect().catch(err => this.logger.error(`Error disconnecting target: ${err.message}`));
    }
  }
}
