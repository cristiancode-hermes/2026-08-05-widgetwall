import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookmarkDto {
  @ApiPropertyOptional({ example: 'GitHub', description: 'Bookmark title' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'https://github.com', description: 'URL' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sort position' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
