import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { WidgetInstance } from '../widgets/widget-instance.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  widgetInstanceId: string;

  @Column({ type: 'varchar', length: 500 })
  text: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => WidgetInstance, (w: WidgetInstance) => w.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'widgetInstanceId' })
  widgetInstance: WidgetInstance;
}
