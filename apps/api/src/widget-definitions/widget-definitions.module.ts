import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetDefinitionsController } from './widget-definitions.controller';
import { WidgetDefinitionsService } from './widget-definitions.service';
import { WidgetDefinition } from './widget-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WidgetDefinition])],
  controllers: [WidgetDefinitionsController],
  providers: [WidgetDefinitionsService],
  exports: [WidgetDefinitionsService],
})
export class WidgetDefinitionsModule {}
