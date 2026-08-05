import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { Dashboard } from '../dashboards/dashboard.entity';
import { Note } from '../notes/note.entity';
import { Task } from '../tasks/task.entity';
import { Bookmark } from '../bookmarks/bookmark.entity';

@Entity('widget_instances')
export class WidgetInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  dashboardId: string;

  @Column({ type: 'varchar', length: 30 })
  type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string | null;

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'varchar', length: 10, default: 'medium' })
  size: string;

  @Column('simple-json', { default: '{}' })
  config: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Dashboard, (d: Dashboard) => d.widgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dashboardId' })
  dashboard: Dashboard;

  @OneToMany(() => Note, (n: Note) => n.widgetInstance, { cascade: true })
  notes: Note[];

  @OneToMany(() => Task, (t: Task) => t.widgetInstance, { cascade: true })
  tasks: Task[];

  @OneToMany(() => Bookmark, (b: Bookmark) => b.widgetInstance, { cascade: true })
  bookmarks: Bookmark[];
}
