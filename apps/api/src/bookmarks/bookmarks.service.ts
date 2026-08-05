import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(WidgetInstance)
    private readonly widgetRepository: Repository<WidgetInstance>,
  ) {}

  async findAll(widgetId: string, userId: string): Promise<Bookmark[]> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }
    return this.bookmarkRepository.find({
      where: { widgetInstanceId: widgetId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(widgetId: string, userId: string, dto: CreateBookmarkDto): Promise<Bookmark> {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }

    const maxPos = await this.bookmarkRepository
      .createQueryBuilder('b')
      .where('b.widgetInstanceId = :widgetId', { widgetId })
      .select('MAX(b.position)', 'max')
      .getRawOne();

    const bookmark = this.bookmarkRepository.create({
      widgetInstanceId: widgetId,
      title: dto.title,
      url: dto.url,
      position: dto.position ?? ((maxPos?.max ?? -1) + 1),
    } as any);
    return this.bookmarkRepository.save(bookmark as any) as unknown as Bookmark;
  }

  async update(id: string, userId: string, dto: UpdateBookmarkDto): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id },
      relations: { widgetInstance: { dashboard: true } },
    });
    if (!bookmark || bookmark.widgetInstance.dashboard.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.bookmarkRepository.update(id, dto as any);
    return this.bookmarkRepository.findOne({ where: { id } }) as Promise<Bookmark>;
  }

  async remove(id: string, userId: string): Promise<void> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id },
      relations: { widgetInstance: { dashboard: true } },
    });
    if (!bookmark || bookmark.widgetInstance.dashboard.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.bookmarkRepository.remove(bookmark);
  }
}
