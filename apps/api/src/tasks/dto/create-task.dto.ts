import { IsString, IsOptional, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy groceries', description: 'Task text' })
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiPropertyOptional({ example: 0, description: 'Sort position' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
