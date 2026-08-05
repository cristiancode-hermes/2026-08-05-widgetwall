import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('widgets/:widgetId/bookmarks')
  @ApiOperation({ summary: 'Get all bookmarks for a widget' })
  findAll(@Param('widgetId') widgetId: string, @CurrentUser() user: User) {
    return this.bookmarksService.findAll(widgetId, user.id);
  }

  @Post('widgets/:widgetId/bookmarks')
  @ApiOperation({ summary: 'Create a bookmark on a widget' })
  create(@Param('widgetId') widgetId: string, @CurrentUser() user: User, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(widgetId, user.id, dto);
  }

  @Patch('bookmarks/:id')
  @ApiOperation({ summary: 'Update a bookmark' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateBookmarkDto) {
    return this.bookmarksService.update(id, user.id, dto);
  }

  @Delete('bookmarks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bookmark' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookmarksService.remove(id, user.id);
  }
}
