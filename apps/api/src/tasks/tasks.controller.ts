import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('widgets/:widgetId/tasks')
  @ApiOperation({ summary: 'Get all tasks for a widget' })
  findAll(@Param('widgetId') widgetId: string, @CurrentUser() user: User) {
    return this.tasksService.findAll(widgetId, user.id);
  }

  @Post('widgets/:widgetId/tasks')
  @ApiOperation({ summary: 'Create a task on a widget' })
  create(@Param('widgetId') widgetId: string, @CurrentUser() user: User, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(widgetId, user.id, dto);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, user.id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user.id);
  }

  @Patch('widgets/:widgetId/tasks/reorder')
  @ApiOperation({ summary: 'Reorder tasks within a widget' })
  reorder(@Param('widgetId') widgetId: string, @CurrentUser() user: User, @Body() dto: ReorderTasksDto) {
    return this.tasksService.reorder(widgetId, user.id, dto);
  }
}
