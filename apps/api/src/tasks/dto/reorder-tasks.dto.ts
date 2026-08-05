import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderTasksDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Task IDs in desired order' })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  orderedIds: string[];
}
