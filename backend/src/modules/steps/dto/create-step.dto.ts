import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStepDto {
  @ApiProperty({
    description: 'ID da conexão de origem',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  sourceConnectionId: number;

  @ApiProperty({
    description: 'Query SQL de extração (SELECT)',
    example: 'SELECT id, nome, email FROM usuarios_legados',
  })
  @IsString()
  @IsNotEmpty()
  sourceQuery: string;

  @ApiProperty({
    description: 'ID da conexão de destino',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  targetConnectionId: number;

  @ApiProperty({
    description: 'Query SQL de carga (INSERT/UPDATE/UPSERT) com placeholders',
    example: 'INSERT INTO users (external_id, full_name, email) VALUES (:id, :nome, :email)',
  })
  @IsString()
  @IsNotEmpty()
  targetQuery: string;

  @ApiProperty({
    description: 'Ordem de execução na pilha da integração',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  executionOrder: number;

  @ApiPropertyOptional({
    description: 'Tamanho do lote para processamento (batch size)',
    example: 1000,
    default: 1000,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  batchSize?: number;
}
