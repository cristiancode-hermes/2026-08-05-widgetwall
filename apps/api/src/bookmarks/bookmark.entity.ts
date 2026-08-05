import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { WidgetInstance } from '../widgets/widget-instance.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  widgetInstanceId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 2000 })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon: string | null;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => WidgetInstance, (w: WidgetInstance) => w.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'widgetInstanceId' })
  widgetInstance: WidgetInstance;
}
