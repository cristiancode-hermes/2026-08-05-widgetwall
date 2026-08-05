import { IsString, IsOptional, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWidgetDto {
  @ApiProperty({ example: 'clock', description: 'Widget type identifier' })
  @IsString()
  type: string;

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
}
