import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type SkillCategory = 'tecnica' | 'blanda' | 'digital';

// Catálogo de habilidades (Diferenciador 1).
@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  label!: string;

  @Column()
  category!: SkillCategory;
}
