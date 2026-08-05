import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { Dashboard } from './dashboard.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dashboard, WidgetInstance])],
  controllers: [DashboardsController],
  providers: [DashboardsService],
  exports: [DashboardsService],
})
export class DashboardsModule {}
