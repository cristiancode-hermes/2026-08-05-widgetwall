import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';
import { WidgetInstance } from './widget-instance.entity';
import { Dashboard } from '../dashboards/dashboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WidgetInstance, Dashboard])],
  controllers: [WidgetsController],
  providers: [WidgetsService],
  exports: [WidgetsService],
})
export class WidgetsModule {}
