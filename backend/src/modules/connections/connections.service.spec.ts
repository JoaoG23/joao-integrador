import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConnectionsService } from './connections.service';
import { PrismaService } from '../../database/prisma.service';

describe('DatabaseConnectionsService', () => {
  let service: DatabaseConnectionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    databaseConnection: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConnectionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DatabaseConnectionsService>(DatabaseConnectionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a database connection successfully', async () => {
      const dbData = { name: 'DB Test', type: 'POSTGRES', host: 'localhost', port: 5432, database: 'test', username: 'user', password: 'password' };
      mockPrismaService.databaseConnection.create.mockResolvedValue({ id: 1, ...dbData });

      const result = await service.create(dbData);

      expect(mockPrismaService.databaseConnection.create).toHaveBeenCalledWith({ data: dbData });
      expect(result.id).toBe(1);
    });

    it('should throw error when missing required fields', async () => {
       const dbData = { type: 'POSTGRES' };
       mockPrismaService.databaseConnection.create.mockRejectedValue(new Error('Missing required fields'));

       await expect(service.create(dbData)).rejects.toThrow('Missing required fields');
    });
  });

  describe('findOne', () => {
    it('should find connection by id', async () => {
      const id = 1;
      const mockResult = { id, name: 'DB' };
      mockPrismaService.databaseConnection.findUnique.mockResolvedValue(mockResult);

      const result = await service.findOne(id);

      expect(mockPrismaService.databaseConnection.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockResult);
    });

    it('should return null when connection is not found', async () => {
      const id = 999;
      mockPrismaService.databaseConnection.findUnique.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toBeNull();
    });
  });
});
