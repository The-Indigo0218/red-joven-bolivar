import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { InterestSlug } from '../young/young.entity';

// Agregación pre-calculada de demanda por zona + categoría + fecha.
// Núcleo de valor: diseñada para escalar (snapshots, no cómputo en vivo).
@Entity('demand_snapshots')
export class DemandSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  barrio!: string;

  @Column()
  interestSlug!: InterestSlug;

  @Column('int')
  youngCount!: number;

  @Column('int')
  slotsOffered!: number;

  @Column('int')
  gap!: number; // youngCount - slotsOffered

  @Column('date')
  snapshotDate!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
