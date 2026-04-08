import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Nome da integração',
    example: 'Extração BD Vendas para DW',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição ou detalhes adicionais da integração',
    example: 'Este job move tabelas de clientes e ordens de serviço toda meia-noite',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Expressão CRON para o agendamento',
    example: '0 0 * * *',
  })
  @IsString()
  @IsNotEmpty()
  cronExpression: string;

  @ApiPropertyOptional({
    description: 'Se o agendamento deve ficar ativo',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
