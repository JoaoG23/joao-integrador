import { Module } from '@nestjs/common';
import { DatabaseConnectionsController } from './connections.controller';
import { DatabaseConnectionsService } from './connections.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DatabaseConnectionsController],
  providers: [DatabaseConnectionsService],
  exports: [DatabaseConnectionsService],
})
export class ConnectionsModule {}
