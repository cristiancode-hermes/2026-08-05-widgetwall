import {
  Entity, PrimaryGeneratedColumn, Column
} from 'typeorm';

@Entity('widget_definitions')
export class WidgetDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column('simple-json', { default: '{}' })
  defaultConfig: Record<string, unknown>;

  @Column({ type: 'varchar', length: 10, default: 'small' })
  minSize: string;

  @Column({ type: 'varchar', length: 10, default: 'large' })
  maxSize: string;
}
