import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ enum: ['light', 'dark', 'system'], example: 'dark' })
  @IsString()
  @IsIn(['light', 'dark', 'system'])
  defaultTheme: 'light' | 'dark' | 'system';
}
