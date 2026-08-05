import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Dashboard } from '../dashboards/dashboard.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  displayName: string | null;

  @Column('simple-json', { nullable: true })
  settings: { defaultTheme: 'light' | 'dark' | 'system' } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Dashboard, (d: Dashboard) => d.user)
  dashboards: Dashboard[];
}
