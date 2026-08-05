import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(WidgetInstance)
    private readonly widgetRepository: Repository<WidgetInstance>,
  ) {}

  async findAll(widgetId: string, userId: string): Promise<Note[]> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }
    return this.noteRepository.find({
      where: { widgetInstanceId: widgetId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(widgetId: string, userId: string, dto: CreateNoteDto): Promise<Note> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }

    const maxPos = await this.noteRepository
      .createQueryBuilder('n')
      .where('n.widgetInstanceId = :widgetId', { widgetId })
      .select('MAX(n.position)', 'max')
      .getRawOne();

    const note = this.noteRepository.create({
      widgetInstanceId: widgetId,
      content: dto.content,
      color: dto.color ?? null,
      position: dto.position ?? ((maxPos?.max ?? -1) + 1),
    } as any);
    return this.noteRepository.save(note as any) as unknown as Note;
  }

  async update(id: string, userId: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: { widgetInstance: { dashboard: true } },
    });
    if (!note || note.widgetInstance.dashboard.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    await this.noteRepository.update(id, dto as any);
    return this.noteRepository.findOne({ where: { id } }) as Promise<Note>;
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: { widgetInstance: { dashboard: true } },
    });
    if (!note || note.widgetInstance.dashboard.userId !== userId) {
      throw new NotFoundException('Note not found');
    }
    await this.noteRepository.remove(note);
  }
}
