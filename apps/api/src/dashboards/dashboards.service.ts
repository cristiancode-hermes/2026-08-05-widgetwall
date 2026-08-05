import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async findAll(userId: string): Promise<Dashboard[]> {
    return this.dashboardRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOne({
      where: { id, userId },
      relations: { widgets: true },
      order: { widgets: { position: 'ASC' } },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async create(userId: string, dto: CreateDashboardDto): Promise<Dashboard> {
    const slug = dto.slug || slugify(dto.name);

    const existing = await this.dashboardRepository.findOne({
      where: { userId, slug },
    });
    if (existing) throw new ConflictException('A dashboard with this slug already exists');

    const dashboard = this.dashboardRepository.create({
      userId,
      name: dto.name,
      slug,
    } as any);
    return this.dashboardRepository.save(dashboard as any) as unknown as Dashboard;
  }

  async update(id: string, userId: string, dto: UpdateDashboardDto): Promise<Dashboard> {
    const dashboard = await this.findOne(id, userId);

    if (dto.slug && dto.slug !== dashboard.slug) {
      const existing = await this.dashboardRepository.findOne({
        where: { userId, slug: dto.slug },
      });
      if (existing) throw new ConflictException('Slug already in use');
    }

    const slug = dto.slug || dashboard.slug;
    await this.dashboardRepository.update(id, {
      name: dto.name ?? dashboard.name,
      slug,
    } as any);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const dashboard = await this.findOne(id, userId);
    await this.dashboardRepository.remove(dashboard);
  }
}
