import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Plan de Ruta personal del joven hacia una oportunidad objetivo
// (Diferenciador 1). Persiste el resultado del gap analysis + ruta de cierre.
@Entity('growth_routes')
export class GrowthRoute {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  youngId!: string;

  @Column('uuid')
  targetOpportunityId!: string;

  @Column('float')
  affinityScore!: number; // 0..100

  @Column('uuid', { array: true, default: [] })
  missingSkillIds!: string[];

  @Column('uuid', { array: true, default: [] })
  closingOpportunityIds!: string[];

  @Column()
  headline!: string;

  @CreateDateColumn()
  generatedAt!: Date;
}
