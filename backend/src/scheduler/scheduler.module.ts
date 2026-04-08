import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { OrchestratorService } from '../modules/orchestrator/orchestrator.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronService, OrchestratorService],
  exports: [CronService, OrchestratorService],
})
export class SchedulerModule {}
