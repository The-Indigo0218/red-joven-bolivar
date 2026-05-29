import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type MatchStatus = 'interesado' | 'contactado' | 'vinculado';

// Vínculo joven ↔ oportunidad: la señal "Me interesa". Arranca en
// 'interesado'. El score es la afinidad calculada por reglas (IA en Fase 4).
@Entity('matches')
@Index(['youngId', 'opportunityId'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  youngId!: string;

  @Column('uuid')
  opportunityId!: string;

  @Column({ default: 'interesado' })
  status!: MatchStatus;

  @Column('float', { default: 0 })
  score!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
