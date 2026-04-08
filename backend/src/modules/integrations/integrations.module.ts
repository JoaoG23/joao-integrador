import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { DatabaseModule } from '../../database/database.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';

@Module({
  imports: [DatabaseModule, SchedulerModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
