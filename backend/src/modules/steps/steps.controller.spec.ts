import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationStepsController } from './steps.controller';
import { IntegrationStepsService } from './steps.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

describe('IntegrationStepsController', () => {
  let controller: IntegrationStepsController;
  let service: IntegrationStepsService;
  let orchestrator: OrchestratorService;

  const mockStepsService = {
    create: jest.fn(),
    findAllByIntegration: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrchestratorService = {
    runStep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationStepsController],
      providers: [
        { provide: IntegrationStepsService, useValue: mockStepsService },
        { provide: OrchestratorService, useValue: mockOrchestratorService },
      ],
    }).compile();

    controller = module.get<IntegrationStepsController>(IntegrationStepsController);
    service = module.get<IntegrationStepsService>(IntegrationStepsService);
    orchestrator = module.get<OrchestratorService>(OrchestratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a step successfully', async () => {
      const integrationId = '1';
      const dto: CreateStepDto = { 
        sourceConnectionId: 1, 
        targetConnectionId: 2, 
        sourceQuery: 'SELECT 1', 
        targetQuery: 'INSERT 1', 
        executionOrder: 1, 
        batchSize: 100 
      };
      const mockResult = { id: 1, ...dto, integrationId: 1 };
      mockStepsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(integrationId, dto);

      expect(service.create).toHaveBeenCalledWith({ ...dto, integrationId: 1 });
      expect(result).toEqual(mockResult);
    });

    it('should throw error when service fails', async () => {
      mockStepsService.create.mockRejectedValue(new Error('Creation failed'));
      await expect(controller.create('1', {} as any)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should find all steps for an integration', async () => {
      const integrationId = '1';
      const mockSteps = [{ id: 1, integrationId: 1 }];
      mockStepsService.findAllByIntegration.mockResolvedValue(mockSteps);

      const result = await controller.findAll(integrationId);

      expect(service.findAllByIntegration).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSteps);
    });

    it('should return empty array if no steps found', async () => {
      mockStepsService.findAllByIntegration.mockResolvedValue([]);
      const result = await controller.findAll('1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find a step by id', async () => {
      const id = '1';
      const mockStep = { id: 1, integrationId: 1 };
      mockStepsService.findOne.mockResolvedValue(mockStep);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStep);
    });

    it('should return null if step not found', async () => {
      mockStepsService.findOne.mockResolvedValue(null);
      const result = await controller.findOne('99');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a step successfully', async () => {
      const id = '1';
      const dto: UpdateStepDto = { sourceQuery: 'SELECT 2' };
      const mockResult = { id: 1, ...dto };
      mockStepsService.update.mockResolvedValue(mockResult);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when update fails', async () => {
      mockStepsService.update.mockRejectedValue(new Error('Update failed'));
      await expect(controller.update('1', {})).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove a step successfully', async () => {
      const id = '1';
      const mockResult = { id: 1 };
      mockStepsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when removal fails', async () => {
      mockStepsService.remove.mockRejectedValue(new Error('Delete failed'));
      await expect(controller.remove('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('run', () => {
    it('should call orchestrator.runStep with correct id', async () => {
      const stepId = '1';
      mockOrchestratorService.runStep.mockResolvedValue({ processedRows: 5 });

      const result = await controller.run(stepId);

      expect(orchestrator.runStep).toHaveBeenCalledWith(1);
      expect(result).toEqual({ processedRows: 5 });
    });

    it('should throw error if orchestrator fails', async () => {
      const stepId = '1';
      mockOrchestratorService.runStep.mockRejectedValue(new Error('Execution failed'));

      await expect(controller.run(stepId)).rejects.toThrow('Execution failed');
    });
  });
});
