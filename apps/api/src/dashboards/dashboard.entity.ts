import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { WidgetInstance } from '../widgets/widget-instance.entity';

@Entity('dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column('simple-json', { nullable: true })
  layoutConfig: { columns: number } | null;

  @Column('simple-json', { nullable: true })
  themeOverride: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (u: User) => u.dashboards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => WidgetInstance, (w: WidgetInstance) => w.dashboard, { cascade: true })
  widgets: WidgetInstance[];
}
