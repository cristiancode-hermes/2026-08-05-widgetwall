import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './bookmark.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, WidgetInstance])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
