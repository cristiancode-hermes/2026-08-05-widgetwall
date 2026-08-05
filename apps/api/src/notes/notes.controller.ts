import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('widgets/:widgetId/notes')
  @ApiOperation({ summary: 'Get all notes for a widget' })
  findAll(@Param('widgetId') widgetId: string, @CurrentUser() user: User) {
    return this.notesService.findAll(widgetId, user.id);
  }

  @Post('widgets/:widgetId/notes')
  @ApiOperation({ summary: 'Create a note on a widget' })
  create(@Param('widgetId') widgetId: string, @CurrentUser() user: User, @Body() dto: CreateNoteDto) {
    return this.notesService.create(widgetId, user.id, dto);
  }

  @Patch('notes/:id')
  @ApiOperation({ summary: 'Update a note' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, user.id, dto);
  }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notesService.remove(id, user.id);
  }
}
