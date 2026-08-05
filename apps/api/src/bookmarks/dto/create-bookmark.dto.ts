import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ example: 'GitHub', description: 'Bookmark title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'https://github.com', description: 'URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 0, description: 'Sort position' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
