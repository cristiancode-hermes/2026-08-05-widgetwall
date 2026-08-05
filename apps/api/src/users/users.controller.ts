import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change password' })
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  deleteMe(@CurrentUser() user: User) {
    return this.usersService.deleteUser(user.id);
  }

  @Get('me/settings')
  @ApiOperation({ summary: 'Get user settings' })
  getSettings(@CurrentUser() user: User) {
    return this.usersService.getSettings(user.id);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update user settings' })
  updateSettings(@CurrentUser() user: User, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateSettings(user.id, dto);
  }
}
