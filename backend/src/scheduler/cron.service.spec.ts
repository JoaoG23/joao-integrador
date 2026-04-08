import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { OrchestratorService } from '../modules/orchestrator/orchestrator.service';

jest.mock('cron', () => ({
  CronJob: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

describe('CronService', () => {
  let service: CronService;
  let prisma: PrismaService;
  let schedulerRegistry: SchedulerRegistry;
  let orchestrator: OrchestratorService;

  const mockPrismaService = {
    integration: {
      findMany: jest.fn(),
    },
  };

  const mockSchedulerRegistry = {
    addCronJob: jest.fn(),
    deleteCronJob: jest.fn(),
    getCronJob: jest.fn(),
  };

  const mockOrchestratorService = {
    runIntegration: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
        { provide: OrchestratorService, useValue: mockOrchestratorService },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    prisma = module.get<PrismaService>(PrismaService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    orchestrator = module.get<OrchestratorService>(OrchestratorService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAllJobs', () => {
    it('should register all active integrations', async () => {
      const integrations = [
        { id: 1, cronExpression: '* * * * *', isActive: true },
        { id: 2, cronExpression: '0 0 * * *', isActive: true },
      ];
      mockPrismaService.integration.findMany.mockResolvedValue(integrations);

      await service.registerAllJobs();

      expect(mockPrismaService.integration.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when registering an integration', async () => {
      const integrations = [
        { id: 1, cronExpression: 'invalid-expression', isActive: true },
      ];
      mockPrismaService.integration.findMany.mockResolvedValue(integrations);
      
      // The addCronJob method in CronService constructs CronJob which would throw for invalid expression
      // But in our test mockSchedulerRegistry.addCronJob doesn't throw by default
      // Let's make it throw to simulate a registry error
      mockSchedulerRegistry.addCronJob.mockImplementationOnce(() => {
        throw new Error('Scheduler error');
      });

      await service.registerAllJobs();

      expect(mockPrismaService.integration.findMany).toHaveBeenCalled();
      // Should not bubble up the error since there's a try-catch in registerAllJobs
    });
  });

  describe('addCronJob', () => {
    it('should add and start a new job', () => {
      const integration = { id: 123, cronExpression: '* * * * *' };
      
      service.addCronJob(integration);

      expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalledWith(
        `integration_${integration.id}`,
        expect.anything()
      );
    });
  });
});
