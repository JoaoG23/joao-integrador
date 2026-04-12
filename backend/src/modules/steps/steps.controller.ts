import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { IntegrationStepsService } from './steps.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@ApiTags('integrations')
@Controller('integrations/:integrationId/steps')
export class IntegrationStepsController {
  constructor(private service: IntegrationStepsService) {}

  /**
   * Add a new execution step to an existing integration.
   * @param integrationId The ID of the parent integration.
   * @param data Step configuration including source/target connections and queries.
   * @returns The newly created step record.
   */
  @Post()
  create(@Param('integrationId') integrationId: string, @Body() data: CreateStepDto) {
    return this.service.create({ ...data, integrationId: +integrationId });
  }

  /**
   * List all execution steps belonging to a specific integration, ordered by execution order.
   * @param integrationId The parent integration ID.
   * @returns An array of integration steps.
   */
  @Get()
  findAll(@Param('integrationId') integrationId: string) {
    return this.service.findAllByIntegration(+integrationId);
  }

  /**
   * Get details of a specific integration step.
   * @param id The step ID.
   * @returns Detailed step configuration.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  /**
   * Update an existing integration step.
   * @param id The step ID to update.
   * @param data The new step data.
   * @returns The updated step record.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateStepDto) {
    return this.service.update(+id, data);
  }

  /**
   * Remove a step from an integration.
   * @param id The step ID.
   * @returns The deleted step record.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
