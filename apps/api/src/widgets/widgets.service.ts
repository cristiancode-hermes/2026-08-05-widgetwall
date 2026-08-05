import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WidgetInstance } from './widget-instance.entity';
import { Dashboard } from '../dashboards/dashboard.entity';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { ReorderWidgetsDto } from './dto/reorder-widgets.dto';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectRepository(WidgetInstance)
    private readonly widgetRepository: Repository<WidgetInstance>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async findAll(dashboardId: string, userId: string): Promise<WidgetInstance[]> {
    const dashboard = await this.dashboardRepository.findOne({ where: { id: dashboardId, userId } });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return this.widgetRepository.find({
      where: { dashboardId },
      order: { position: 'ASC' },
    });
  }

  async create(dashboardId: string, userId: string, dto: CreateWidgetDto): Promise<WidgetInstance> {
    const dashboard = await this.dashboardRepository.findOne({ where: { id: dashboardId, userId } });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    const maxPos = await this.widgetRepository
      .createQueryBuilder('w')
      .where('w.dashboardId = :dashboardId', { dashboardId })
      .select('MAX(w.position)', 'max')
      .getRawOne();

    const widget = this.widgetRepository.create({
      dashboardId,
      type: dto.type,
      position: dto.position ?? ((maxPos?.max ?? -1) + 1),
      size: dto.size ?? 'medium',
    } as any);
    return this.widgetRepository.save(widget as any) as unknown as WidgetInstance;
  }

  async update(id: string, userId: string, dto: UpdateWidgetDto): Promise<WidgetInstance> {
    const widget = await this.widgetRepository.findOne({
      where: { id },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }
    await this.widgetRepository.update(id, dto as any);
    return this.widgetRepository.findOne({ where: { id } }) as Promise<WidgetInstance>;
  }

  async remove(id: string, userId: string): Promise<void> {
    const widget = await this.widgetRepository.findOne({
      where: { id },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }
    await this.widgetRepository.remove(widget);
  }

  async reorder(dashboardId: string, userId: string, dto: ReorderWidgetsDto): Promise<WidgetInstance[]> {
    const dashboard = await this.dashboardRepository.findOne({ where: { id: dashboardId, userId } });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    const widgets = await this.widgetRepository.find({ where: { dashboardId } });
    const widgetMap = new Map(widgets.map((w) => [w.id, w]));

    for (let i = 0; i < dto.orderedIds.length; i++) {
      const widget = widgetMap.get(dto.orderedIds[i]);
      if (widget) {
        widget.position = i;
        await this.widgetRepository.save(widget as any);
      }
    }

    return this.widgetRepository.find({
      where: { dashboardId },
      order: { position: 'ASC' },
    });
  }
}
