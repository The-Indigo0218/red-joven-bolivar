import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CivicCoinTransactionType = 'earned' | 'redeemed';

// Registro inmutable de cada movimiento de CivicCoins (Diferenciador 2).
@Entity('civiccoins_transactions')
export class CivicCoinTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  youngId!: string;

  @Column()
  type!: CivicCoinTransactionType;

  @Column('int')
  amount!: number;

  @Column('uuid', { nullable: true })
  activityId!: string | null;

  // Validador que acredita la actividad (otro joven / coordinador).
  @Column('uuid', { nullable: true })
  validatorId!: string | null;

  @Column()
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
