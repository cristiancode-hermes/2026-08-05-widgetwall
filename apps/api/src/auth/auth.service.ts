import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUsername = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }
    const existingEmail = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    } as any);
    const saved = await this.userRepository.save(user as any) as unknown as User;
    const token = this.generateToken(saved);

    const { password, ...result } = saved;
    return { user: result, token };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [
        { username: dto.usernameOrEmail },
        { email: dto.usernameOrEmail },
      ],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password, ...result } = user;
    return { user: result, token };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return { user: result };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, username: user.username, email: user.email };
    return this.jwtService.sign(payload);
  }
}
