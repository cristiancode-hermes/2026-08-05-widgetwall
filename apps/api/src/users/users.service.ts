import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateUser(userId: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }
    await this.userRepository.update(userId, dto as any);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return { user: result };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashed } as any);
    return { message: 'Password updated successfully' };
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async getSettings(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { defaultTheme: user.settings?.defaultTheme ?? 'system' };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const settings = { ...(user.settings || {}), defaultTheme: dto.defaultTheme };
    await this.userRepository.update(userId, { settings } as any);
    return { settings: { defaultTheme: dto.defaultTheme } };
  }
}
