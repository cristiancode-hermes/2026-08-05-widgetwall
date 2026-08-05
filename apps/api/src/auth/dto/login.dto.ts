import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'demo', description: 'Username or email' })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ example: 'demo1234', description: 'Password' })
  @IsString()
  password: string;
}
