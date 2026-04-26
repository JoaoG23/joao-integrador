import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../database/prisma.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { CronService } from '../../scheduler/cron.service';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let prisma: PrismaService;
  let cron: CronService;

  const mockPrismaService = {
    integration: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockOrchestratorService = {
    runIntegration: jest.fn(),
  };

  const mockCronService = {
    addCronJob: jest.fn(),
    deleteCronJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OrchestratorService, useValue: mockOrchestratorService },
        { provide: CronService, useValue: mockCronService },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
    prisma = module.get<PrismaService>(PrismaService);
    cron = module.get<CronService>(CronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an integration and add to cron if active', async () => {
      const integrationData = { name: 'New Integration', cronExpression: '* * * * *', isActive: true };
      mockPrismaService.integration.create.mockResolvedValue({ id: 1, ...integrationData });

      const result = await service.create(integrationData);

      expect(mockPrismaService.integration.create).toHaveBeenCalledWith({ data: integrationData });
      expect(mockCronService.addCronJob).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should return error if creation fails', async () => {
      const integrationData = { name: 'Fail Integration', isActive: false };
      mockPrismaService.integration.create.mockRejectedValue(new Error('Internal error'));

      await expect(service.create(integrationData)).rejects.toThrow('Internal error');
    });
  });

  describe('run', () => {
    it('should successfully run integration via orchestrator', async () => {
      const integrationId = 1;
      mockOrchestratorService.runIntegration.mockResolvedValue(undefined);

      await service.run(integrationId);

      expect(mockOrchestratorService.runIntegration).toHaveBeenCalledWith(integrationId);
    });
  });

  describe('findOne', () => {
    it('should return integration details when found', async () => {
      const id = 123;
      const mockResult = { id, name: 'Integration' };
      mockPrismaService.integration.findUnique.mockResolvedValue(mockResult);

      const result = await service.findOne(id);

      expect(mockPrismaService.integration.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          steps: true,
          logs: {
            orderBy: { startTime: 'desc' },
          },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update integration and add to cron if active', async () => {
      const id = 1;
      const data = { isActive: true };
      mockPrismaService.integration.update.mockResolvedValue({ id, isActive: true });

      await service.update(id, data);

      expect(mockPrismaService.integration.update).toHaveBeenCalledWith({ where: { id }, data });
      expect(mockCronService.addCronJob).toHaveBeenCalled();
    });

    it('should update integration and delete from cron if inactive', async () => {
      const id = 1;
      const data = { isActive: false };
      mockPrismaService.integration.update.mockResolvedValue({ id, isActive: false });

      await service.update(id, data);

      expect(mockCronService.deleteCronJob).toHaveBeenCalledWith(id);
    });
  });

  describe('remove', () => {
    it('should remove integration and delete from cron', async () => {
      const id = 1;
      mockPrismaService.integration.delete.mockResolvedValue({ id });

      await service.remove(id);

      expect(mockCronService.deleteCronJob).toHaveBeenCalledWith(id);
      expect(mockPrismaService.integration.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
