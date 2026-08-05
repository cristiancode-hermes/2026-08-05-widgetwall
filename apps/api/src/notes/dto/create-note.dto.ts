import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Buy groceries', description: 'Note content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: '#ffeb3b', description: 'Note color' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sort position' })
  @IsOptional()
  @IsInt()
  position?: number;
}
