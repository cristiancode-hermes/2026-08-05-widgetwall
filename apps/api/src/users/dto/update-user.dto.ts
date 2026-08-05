import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Demo User', description: 'Display name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({ example: 'newemail@example.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
