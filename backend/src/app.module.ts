import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { StepsModule } from './modules/steps/steps.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    DatabaseModule,
    IntegrationsModule,
    ConnectionsModule,
    StepsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
