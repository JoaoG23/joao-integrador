import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConnectionsService } from './connections.service';
import { PrismaService } from '../../database/prisma.service';
import { AdapterFactory } from '../../adapters/adapter.factory';

describe('DatabaseConnectionsService', () => {
  let service: DatabaseConnectionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    databaseConnection: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAdapter = {
    connect: jest.fn(),
    disconnect: jest.fn(),
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

  describe('update', () => {
    it('should update a database connection', async () => {
      const id = 1;
      const updateData = { name: 'Updated Name' };
      mockPrismaService.databaseConnection.update.mockResolvedValue({ id, ...updateData });

      const result = await service.update(id, updateData);

      expect(mockPrismaService.databaseConnection.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should remove a database connection', async () => {
      const id = 1;
      mockPrismaService.databaseConnection.delete.mockResolvedValue({ id });

      const result = await service.remove(id);

      expect(mockPrismaService.databaseConnection.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result.id).toBe(id);
    });
  });

  describe('testConnection', () => {
    it('should return success when connection is successful', async () => {
      const config = { driver: 'postgres', host: 'localhost' };
      jest.spyOn(AdapterFactory, 'create').mockReturnValue(mockAdapter as any);
      mockAdapter.connect.mockResolvedValue(undefined);

      const result = await service.testConnection(config);

      expect(result).toEqual({ success: true, message: 'Connection successful' });
      expect(mockAdapter.connect).toHaveBeenCalled();
      expect(mockAdapter.disconnect).toHaveBeenCalled();
    });

    it('should return failure when connection fails', async () => {
      const config = { driver: 'postgres', host: 'localhost' };
      jest.spyOn(AdapterFactory, 'create').mockReturnValue(mockAdapter as any);
      mockAdapter.connect.mockRejectedValue(new Error('Connection failed'));

      const result = await service.testConnection(config);

      expect(result).toEqual({ success: false, message: 'Connection failed: Connection failed' });
    });

    it('should return failure when driver is missing', async () => {
      const result = await service.testConnection({});
      expect(result.success).toBe(false);
      expect(result.message).toBe('Driver is required');
    });
  });
});
