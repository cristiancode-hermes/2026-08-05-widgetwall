import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { WidgetsModule } from './widgets/widgets.module';
import { WidgetDefinitionsModule } from './widget-definitions/widget-definitions.module';
import { NotesModule } from './notes/notes.module';
import { TasksModule } from './tasks/tasks.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { WeatherModule } from './weather/weather.module';
import { RssModule } from './rss/rss.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || 'data/widgetwall.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    DashboardsModule,
    WidgetsModule,
    WidgetDefinitionsModule,
    NotesModule,
    TasksModule,
    BookmarksModule,
    WeatherModule,
    RssModule,
    SeedModule,
  ],
})
export class AppModule {}
