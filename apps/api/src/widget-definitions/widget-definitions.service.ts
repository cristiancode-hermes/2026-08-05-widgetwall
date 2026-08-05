import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WidgetDefinition } from './widget-definition.entity';

@Injectable()
export class WidgetDefinitionsService {
  constructor(
    @InjectRepository(WidgetDefinition)
    private readonly definitionRepository: Repository<WidgetDefinition>,
  ) {}

  async findAll(): Promise<WidgetDefinition[]> {
    return this.definitionRepository.find({ order: { name: 'ASC' } });
  }
}
