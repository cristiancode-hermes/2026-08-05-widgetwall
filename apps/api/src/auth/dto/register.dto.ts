import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'demo', description: 'Unique username' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'demo@widgetwall.dev', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'demo1234', description: 'Password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password: string;
}
