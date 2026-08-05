import { IsString, IsOptional, IsInt, IsIn, IsObject, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWidgetDto {
  @ApiPropertyOptional({ description: 'Widget-specific config' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 0, description: '0-based grid position' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ example: 'medium', description: 'Widget size' })
  @IsOptional()
  @IsString()
  @IsIn(['small', 'medium', 'large'])
  size?: string;

  @ApiPropertyOptional({ example: 'My Widget', description: 'Widget title' })
  @IsOptional()
  @IsString()
  title?: string;
}
