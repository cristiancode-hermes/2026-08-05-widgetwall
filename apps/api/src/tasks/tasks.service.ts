import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(WidgetInstance)
    private readonly widgetRepository: Repository<WidgetInstance>,
  ) {}

  async findAll(widgetId: string, userId: string): Promise<Task[]> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }
    return this.taskRepository.find({
      where: { widgetInstanceId: widgetId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(widgetId: string, userId: string, dto: CreateTaskDto): Promise<Task> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }

    const maxPos = await this.taskRepository
      .createQueryBuilder('t')
      .where('t.widgetInstanceId = :widgetId', { widgetId })
      .select('MAX(t.position)', 'max')
      .getRawOne();

    const task = this.taskRepository.create({
      widgetInstanceId: widgetId,
      text: dto.text,
      position: dto.position ?? ((maxPos?.max ?? -1) + 1),
    } as any);
    return this.taskRepository.save(task as any) as unknown as Task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { widgetInstance: { dashboard: true } },
    });
    if (!task || task.widgetInstance.dashboard.userId !== userId) {
      throw new NotFoundException('Task not found');
    }
    await this.taskRepository.update(id, dto as any);
    return this.taskRepository.findOne({ where: { id } }) as Promise<Task>;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { widgetInstance: { dashboard: true } },
    });
    if (!task || task.widgetInstance.dashboard.userId !== userId) {
      throw new NotFoundException('Task not found');
    }
    await this.taskRepository.remove(task);
  }

  async reorder(widgetId: string, userId: string, dto: ReorderTasksDto): Promise<Task[]> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }

    const tasks = await this.taskRepository.find({ where: { widgetInstanceId: widgetId } });
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    for (let i = 0; i < dto.orderedIds.length; i++) {
      const task = taskMap.get(dto.orderedIds[i]);
      if (task) {
        task.position = i;
        await this.taskRepository.save(task as any);
      }
    }

    return this.taskRepository.find({
      where: { widgetInstanceId: widgetId },
      order: { position: 'ASC' },
    });
  }
}
