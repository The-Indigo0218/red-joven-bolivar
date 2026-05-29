import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type SkillSource = 'cv' | 'declarado';
export type SkillLevel = 'basico' | 'intermedio' | 'avanzado';

// Habilidades de cada joven (origen CV o declarado + nivel).
@Entity('young_skills')
@Index(['youngId', 'skillId'], { unique: true })
export class YoungSkill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  youngId!: string;

  @Column('uuid')
  skillId!: string;

  @Column({ default: 'declarado' })
  source!: SkillSource;

  @Column({ default: 'basico' })
  level!: SkillLevel;
}
