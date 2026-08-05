import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { ReorderWidgetsDto } from './dto/reorder-widgets.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('widgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get('dashboards/:dashboardId/widgets')
  @ApiOperation({ summary: 'Get all widgets for a dashboard' })
  findAll(@Param('dashboardId') dashboardId: string, @CurrentUser() user: User) {
    return this.widgetsService.findAll(dashboardId, user.id);
  }

  @Post('dashboards/:dashboardId/widgets')
  @ApiOperation({ summary: 'Create a widget on a dashboard' })
  create(@Param('dashboardId') dashboardId: string, @CurrentUser() user: User, @Body() dto: CreateWidgetDto) {
    return this.widgetsService.create(dashboardId, user.id, dto);
  }

  @Patch('widgets/:id')
  @ApiOperation({ summary: 'Update a widget' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateWidgetDto) {
    return this.widgetsService.update(id, user.id, dto);
  }

  @Delete('widgets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a widget' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.widgetsService.remove(id, user.id);
  }

  @Patch('dashboards/:dashboardId/widgets/reorder')
  @ApiOperation({ summary: 'Reorder widgets on a dashboard' })
  reorder(@Param('dashboardId') dashboardId: string, @CurrentUser() user: User, @Body() dto: ReorderWidgetsDto) {
    return this.widgetsService.reorder(dashboardId, user.id, dto);
  }
}
