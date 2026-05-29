import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { InterestSlug, OpportunityKind } from '../young/young.entity';

// Modalidad de participación: define si el joven debe asistir presencialmente,
// puede hacerlo en línea o es una combinación de ambas.
export type OpportunityModality = 'presencial' | 'virtual' | 'hibrido';

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  organization!: string;

  @Column()
  kind!: OpportunityKind;

  @Column('text', { array: true })
  requirements!: string[];

  @Column('int')
  slotsTotal!: number;

  @Column('int')
  slotsAvailable!: number;

  @Column()
  barrio!: string;

  // Presencial por defecto: la mayoría de la oferta local del demo lo es.
  @Column({ default: 'presencial' })
  modalidad!: OpportunityModality;

  @Column('text', { array: true })
  interests!: InterestSlug[];
}
