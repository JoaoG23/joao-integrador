import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationStepsService } from './steps.service';
import { PrismaService } from '../../database/prisma.service';

describe('IntegrationStepsService', () => {
  let service: IntegrationStepsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    integrationStep: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationStepsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<IntegrationStepsService>(IntegrationStepsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an integration step successfully', async () => {
      const stepData = { 
        integrationId: 1, 
        sourceConnectionId: 1, 
        targetConnectionId: 2, 
        executionOrder: 1, 
        sourceQuery: 'SELECT 1', 
        targetQuery: 'INSERT 1', 
        batchSize: 100 
      };
      
      mockPrismaService.integrationStep.create.mockResolvedValue(stepData);

      const result = await service.create(stepData);

      expect(mockPrismaService.integrationStep.create).toHaveBeenCalledWith({ data: stepData });
      expect(result).toBe(stepData);
    });

    it('should throw an error when integrationId or other field is missing', async () => {
      const stepData = { integrationId: null }; 
      mockPrismaService.integrationStep.create.mockRejectedValue(new Error('Invalid data'));

      await expect(service.create(stepData)).rejects.toThrow('Invalid data');
    });
  });

  describe('findAllByIntegration', () => {
    it('should find all steps by integration id', async () => {
      const integrationId = 1;
      const mockSteps = [{ id: 1, integrationId, executionOrder: 1 }];
      
      mockPrismaService.integrationStep.findMany.mockResolvedValue(mockSteps);

      const result = await service.findAllByIntegration(integrationId);

      expect(mockPrismaService.integrationStep.findMany).toHaveBeenCalledWith({
        where: { integrationId },
        orderBy: { executionOrder: 'asc' },
      });
      expect(result).toEqual(mockSteps);
    });
  });

  describe('findOne', () => {
    it('should find step by id', async () => {
      const id = 1;
      const mockStep = { id, integrationId: 1 };
      mockPrismaService.integrationStep.findUnique.mockResolvedValue(mockStep);

      const result = await service.findOne(id);

      expect(mockPrismaService.integrationStep.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockStep);
    });
  });

  describe('update', () => {
    it('should update a step', async () => {
      const id = 1;
      const data = { sourceQuery: 'SELECT 2' };
      mockPrismaService.integrationStep.update.mockResolvedValue({ id, ...data });

      const result = await service.update(id, data);

      expect(mockPrismaService.integrationStep.update).toHaveBeenCalledWith({ where: { id }, data });
      expect(result.sourceQuery).toBe('SELECT 2');
    });
  });

  describe('remove', () => {
    it('should remove a step', async () => {
      const id = 1;
      mockPrismaService.integrationStep.delete.mockResolvedValue({ id });

      const result = await service.remove(id);

      expect(mockPrismaService.integrationStep.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result.id).toBe(id);
    });
  });
});
