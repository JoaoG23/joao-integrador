import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DatabaseConnectionsService } from './connections.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@ApiTags('connections')
@Controller('connections')
export class DatabaseConnectionsController {
  constructor(private service: DatabaseConnectionsService) {}

  /**
   * Register a new external database connection instance (PostgreSQL, MySQL, SQL Server).
   * @param data Connection configuration including host, credentials, and driver.
   * @returns The created connection record.
   */
  @Post()
  create(@Body() data: CreateConnectionDto) {
    return this.service.create(data);
  }

  /**
   * List all configured database connection instances.
   * @returns An array of all registered connections.
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * Fetch details of a specific database connection by its ID.
   * @param id The database connection ID.
   * @returns Detailed connection configuration.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  /**
   * Update an existing database connection configuration.
   * @param id The ID of the connection to update.
   * @param data The new connection data.
   * @returns The updated connection record.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateConnectionDto) {
    return this.service.update(+id, data);
  }

  /**
   * Remove a database connection from the system.
   * @param id The database connection ID.
   * @returns The deleted connection record.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
