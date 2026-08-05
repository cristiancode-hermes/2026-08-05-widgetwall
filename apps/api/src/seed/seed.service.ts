import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Dashboard } from '../dashboards/dashboard.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';
import { WidgetDefinition } from '../widget-definitions/widget-definition.entity';
import { Note } from '../notes/note.entity';
import { Task } from '../tasks/task.entity';
import { Bookmark } from '../bookmarks/bookmark.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    @InjectRepository(WidgetInstance)
    private readonly widgetRepository: Repository<WidgetInstance>,
    @InjectRepository(WidgetDefinition)
    private readonly definitionRepository: Repository<WidgetDefinition>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  async onModuleInit() {
    if (this.configService.get('SEED_DB') !== 'true') {
      this.logger.log('SEED_DB not set, skipping seed');
      return;
    }

    this.logger.log('Seeding database...');
    await this.seedDefinitions();
    await this.seedDemoData();
    this.logger.log('Database seeded successfully');
  }

  async seed() {
    await this.seedDefinitions();
    await this.seedDemoData();
    return { message: 'Database seeded successfully' };
  }

  private async seedDefinitions() {
    const count = await this.definitionRepository.count();
    if (count > 0) {
      this.logger.log('Widget definitions already exist, skipping');
      return;
    }

    const definitions = [
      { type: 'clock', name: 'Clock', icon: 'clock', description: 'Digital clock with timezone support', defaultConfig: { showSeconds: true, format24h: false } },
      { type: 'notes', name: 'Quick Notes', icon: 'sticky-note', description: 'Sticky notes widget', defaultConfig: {} },
      { type: 'todo', name: 'Todo List', icon: 'check-square', description: 'Simple todo list', defaultConfig: {} },
      { type: 'links', name: 'Quick Links', icon: 'link', description: 'Bookmark shortcuts', defaultConfig: {} },
      { type: 'weather', name: 'Weather', icon: 'cloud-sun', description: 'Weather forecast display', defaultConfig: { units: 'celsius' } },
      { type: 'pomodoro', name: 'Pomodoro Timer', icon: 'timer', description: 'Focus timer with configurable intervals', defaultConfig: { workMinutes: 25, breakMinutes: 5 } },
      { type: 'rss', name: 'RSS Reader', icon: 'rss', description: 'RSS feed reader', defaultConfig: {} },
      { type: 'greeting', name: 'Greeting', icon: 'wave', description: 'Personalized greeting message', defaultConfig: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' } },
    ];

    for (const def of definitions) {
      const entity = this.definitionRepository.create(def as any);
      await this.definitionRepository.save(entity as any);
    }

    this.logger.log('Seeded 8 widget definitions');
  }

  private async seedDemoData() {
    const existing = await this.userRepository.findOne({ where: { username: 'demo' } });
    if (existing) {
      this.logger.log('Demo user already exists, skipping');
      return;
    }

    const hashedPassword = await bcrypt.hash('demo1234', 10);
    const user = this.userRepository.create({
      username: 'demo',
      email: 'demo@widgetwall.dev',
      password: hashedPassword,
      displayName: 'Demo User',
      settings: { defaultTheme: 'system' },
    } as any);
    const savedUser = await this.userRepository.save(user as any) as unknown as User;

    const dashboard = this.dashboardRepository.create({
      userId: savedUser.id,
      name: 'Personal',
      slug: 'personal',
      layoutConfig: { columns: 3 },
    } as any);
    const savedDash = await this.dashboardRepository.save(dashboard as any) as unknown as Dashboard;

    // Create widget instances
    const clockWidget = await this.createWidget(savedDash.id, 'clock', 0, 'small', { showSeconds: true, format24h: false });
    const greetingWidget = await this.createWidget(savedDash.id, 'greeting', 1, 'small', { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' });
    const notesWidget = await this.createWidget(savedDash.id, 'notes', 2, 'medium', {});
    const todoWidget = await this.createWidget(savedDash.id, 'todo', 3, 'medium', {});
    const linksWidget = await this.createWidget(savedDash.id, 'links', 4, 'medium', {});
    const weatherWidget = await this.createWidget(savedDash.id, 'weather', 5, 'medium', { units: 'celsius' });

    // Sample notes
    const note = this.noteRepository.create({
      widgetInstanceId: notesWidget.id,
      content: 'Welcome to WidgetWall! This is your personal dashboard.',
      color: '#fff3cd',
      position: 0,
    } as any);
    await this.noteRepository.save(note as any);

    const note2 = this.noteRepository.create({
      widgetInstanceId: notesWidget.id,
      content: 'Try adding more widgets from the sidebar.',
      color: '#cce5ff',
      position: 1,
    } as any);
    await this.noteRepository.save(note2 as any);

    // Sample tasks
    const tasks = [
      { text: 'Set up your dashboard', completed: true, position: 0 },
      { text: 'Add your first bookmark', completed: false, position: 1 },
      { text: 'Customize widget settings', completed: false, position: 2 },
      { text: 'Explore the RSS reader', completed: false, position: 3 },
    ];
    for (const t of tasks) {
      const task = this.taskRepository.create({
        widgetInstanceId: todoWidget.id,
        text: t.text,
        completed: t.completed,
        position: t.position,
      } as any);
      await this.taskRepository.save(task as any);
    }

    // Sample bookmarks
    const bookmarks = [
      { title: 'GitHub', url: 'https://github.com', position: 0 },
      { title: 'NestJS Docs', url: 'https://docs.nestjs.com', position: 1 },
      { title: 'Angular Docs', url: 'https://angular.dev', position: 2 },
    ];
    for (const b of bookmarks) {
      const bookmark = this.bookmarkRepository.create({
        widgetInstanceId: linksWidget.id,
        title: b.title,
        url: b.url,
        position: b.position,
      } as any);
      await this.bookmarkRepository.save(bookmark as any);
    }

    this.logger.log('Seeded demo user, dashboard, and widget instances');
  }

  private async createWidget(dashboardId: string, type: string, position: number, size: string, config: Record<string, unknown>): Promise<WidgetInstance> {
    const widget = this.widgetRepository.create({
      dashboardId,
      type,
      title: null,
      position,
      size,
      config,
    } as any);
    return this.widgetRepository.save(widget as any) as unknown as WidgetInstance;
  }
}
