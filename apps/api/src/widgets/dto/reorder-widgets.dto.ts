import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderWidgetsDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2', 'uuid-3'], description: 'Widget IDs in desired order' })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  orderedIds: string[];
}
