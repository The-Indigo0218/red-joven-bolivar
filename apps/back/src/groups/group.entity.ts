import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { InterestSlug } from '../young/young.entity';

// Grupos sociales por barrio y habilidad, vinculados a Mi Sangre.
@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  barrio!: string;

  @Column()
  interest!: InterestSlug;

  @CreateDateColumn()
  createdAt!: Date;
}
