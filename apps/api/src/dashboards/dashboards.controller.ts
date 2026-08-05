import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all dashboards for current user' })
  findAll(@CurrentUser() user: User) {
    return this.dashboardsService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  create(@CurrentUser() user: User, @Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a dashboard by ID (with widgets)' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.dashboardsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dashboard' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateDashboardDto) {
    return this.dashboardsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a dashboard' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.dashboardsService.remove(id, user.id);
  }
}
