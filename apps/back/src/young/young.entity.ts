import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Tipos de dominio — alineados con docs/API_CONTRACTS.md.
export type InterestSlug =
  | 'tecnologia'
  | 'arte'
  | 'deporte'
  | 'emprendimiento'
  | 'medio-ambiente'
  | 'liderazgo';

export type OpportunityKind = 'empleo' | 'voluntariado' | 'estudio';
export type SeekingType = OpportunityKind | 'todos';

export type EducationLevel =
  | 'primaria'
  | 'bachillerato-en-curso'
  | 'bachiller'
  | 'tecnico'
  | 'tecnologo'
  | 'universitario'
  | 'ninguno';

export type Availability =
  | 'manana'
  | 'tarde'
  | 'noche'
  | 'fines-de-semana'
  | 'tiempo-completo';

@Entity('young_profiles')
export class YoungProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('int')
  age!: number;

  @Column()
  barrio!: string;

  @Column()
  educationLevel!: EducationLevel;

  @Column()
  seeking!: SeekingType;

  @Column('text', { array: true })
  availability!: Availability[];

  @Column('text', { array: true })
  interests!: InterestSlug[];

  @CreateDateColumn()
  createdAt!: Date;
}
