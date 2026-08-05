import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { Dashboard } from '../dashboards/dashboard.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';
import { WidgetDefinition } from '../widget-definitions/widget-definition.entity';
import { Note } from '../notes/note.entity';
import { Task } from '../tasks/task.entity';
import { Bookmark } from '../bookmarks/bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Dashboard, WidgetInstance, WidgetDefinition, Note, Task, Bookmark]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
