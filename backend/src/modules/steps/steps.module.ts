import { Module } from '@nestjs/common';
import { IntegrationStepsController } from './steps.controller';
import { IntegrationStepsService } from './steps.service';
import { DatabaseModule } from '../../database/database.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';

@Module({
  imports: [DatabaseModule, SchedulerModule],
  controllers: [IntegrationStepsController],
  providers: [IntegrationStepsService],
  exports: [IntegrationStepsService],
})
export class StepsModule {}
