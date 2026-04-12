import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private service: IntegrationsService) {}

  /**
   * Create a new integration job with its cron schedule.
   * @param data The integration configuration.
   * @returns The newly created integration.
   */
  @Post()
  create(@Body() data: CreateIntegrationDto) {
    return this.service.create(data);
  }

  /**
   * Retrieve all configured integrations, including their steps.
   * @returns List of all integrations.
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * Get the details of a specific integration by ID, including its execution logs.
   * @param id The integration ID.
   * @returns Detailed integration information.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  /**
   * Update an existing integration job.
   * @param id The integration ID.
   * @param data The new integration data.
   * @returns The updated integration record.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateIntegrationDto) {
    return this.service.update(+id, data);
  }

  /**
   * Remove an integration job and its schedule.
   * @param id The integration ID.
   * @returns The deleted integration record.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  /**
   * Manually trigger the execution of an integration job.
   * @param id The integration ID to run.
   * @returns Confirmation message that the process started.
   */
  @Post(':id/run')
  run(@Param('id') id: string) {
    this.service.run(+id);
    return { message: 'Integration execution started' };
  }
}
