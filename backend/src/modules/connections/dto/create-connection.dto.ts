import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConnectionDto {
  @ApiProperty({
    description: 'Nome identificador da conexão',
    example: 'Banco de Vendas Produção',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Driver do banco de dados (postgres, mysql, mssql)',
    example: 'postgres',
  })
  @IsString()
  @IsNotEmpty()
  driver: string;

  @ApiProperty({
    description: 'Endereço do servidor (host)',
    example: 'localhost',
  })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({
    description: 'Porta de conexão',
    example: 5432,
  })
  @IsInt()
  @IsNotEmpty()
  port: number;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Nome do banco de dados',
    example: 'vendas_db',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiPropertyOptional({
    description: 'Schema do banco (padrão: public)',
    example: 'public',
    default: 'public',
  })
  @IsString()
  @IsOptional()
  schema?: string;
}
