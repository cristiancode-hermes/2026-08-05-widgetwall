import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({ example: 'Personal', description: 'Dashboard name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'personal', description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;
}
