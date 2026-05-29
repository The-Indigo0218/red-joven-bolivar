import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { InterestSlug, OpportunityKind } from '../young/young.entity';

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

  @Column('text', { array: true })
  interests!: InterestSlug[];
}
