import { Test, TestingModule } from '@nestjs/testing';
import { OrchestratorService } from './orchestrator.service';
import { PrismaService } from '../../database/prisma.service';
import { AdapterFactory } from '../../adapters/adapter.factory';

describe('OrchestratorService', () => {
  let service: OrchestratorService;
  let prisma: PrismaService;

  const mockPrismaService = {
    integration: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    integrationStep: {
      findUnique: jest.fn(),
    },
    integrationLog: {
      create: jest.fn(),
    },
  };

  const mockAdapter = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    executeSelect: jest.fn(),
    executeCommand: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrchestratorService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrchestratorService>(OrchestratorService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.spyOn(AdapterFactory, 'create').mockReturnValue(mockAdapter as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runIntegration', () => {
    it('should run integration successfully', async () => {
      const integrationId = 1;
      const mockIntegration = {
        id: integrationId,
        name: 'Test Integration',
        isActive: true,
        steps: [
          {
            executionOrder: 1,
            sourceConnection: {},
            targetConnection: {},
            sourceQuery: 'SELECT * FROM source',
            targetQuery: 'INSERT INTO target',
            batchSize: 10,
          },
        ],
      };

      mockPrismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      mockAdapter.executeSelect.mockResolvedValue([{ id: 1, name: 'Item' }]);
      mockAdapter.connect.mockResolvedValue(undefined);
      mockAdapter.disconnect.mockResolvedValue(undefined);
      mockAdapter.executeCommand.mockResolvedValue(undefined);

      await service.runIntegration(integrationId);

      expect(mockPrismaService.integration.findUnique).toHaveBeenCalledWith({
        where: { id: integrationId },
        include: {
          steps: {
            orderBy: { executionOrder: 'asc' },
            include: { sourceConnection: true, targetConnection: true },
          },
        },
      });
      expect(mockAdapter.executeSelect).toHaveBeenCalled();
      expect(mockPrismaService.integrationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SUCCESS' }),
        }),
      );
    });

    it('should handle integration failure', async () => {
      const integrationId = 1;
      const mockIntegration = {
        id: integrationId,
        name: 'Test Integration',
        isActive: true,
        steps: [
          {
            executionOrder: 1,
            sourceConnection: {},
            targetConnection: {},
          },
        ],
      };

      mockPrismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      mockAdapter.connect.mockRejectedValue(new Error('Connection failed'));

      await service.runIntegration(integrationId);

      expect(mockPrismaService.integrationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ 
            status: 'FAILURE',
            message: 'Connection failed'
          }),
        }),
      );
    });
  });

  describe('runStep', () => {
    it('should run a single step successfully', async () => {
      const stepId = 1;
      const mockStep = {
        id: stepId,
        sourceConnection: {},
        targetConnection: {},
        sourceQuery: 'SELECT * FROM source',
        targetQuery: 'INSERT INTO target',
        batchSize: 10,
      };

      mockPrismaService.integrationStep.findUnique.mockResolvedValue(mockStep);
      mockAdapter.executeSelect.mockResolvedValue([{ id: 1 }]);
      mockAdapter.connect.mockResolvedValue(undefined);
      mockAdapter.disconnect.mockResolvedValue(undefined);
      mockAdapter.executeCommand.mockResolvedValue(undefined);
      
      const result = await service.runStep(stepId);

      expect(result).toEqual({ processedRows: 1 });
      expect(mockAdapter.executeSelect).toHaveBeenCalledWith(mockStep.sourceQuery);
    });

    it('should throw error if step not found', async () => {
      mockPrismaService.integrationStep.findUnique.mockResolvedValue(null);
      await expect(service.runStep(99)).rejects.toThrow('Step 99 not found');
    });
  });
});
