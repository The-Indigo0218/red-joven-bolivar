import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Canjes realizados por jóvenes (voucher + puntos gastados).
@Entity('redemptions')
export class Redemption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  youngId!: string;

  @Column('uuid')
  catalogItemId!: string;

  @Column('int')
  pointsSpent!: number;

  @Column({ unique: true })
  voucherCode!: string;

  @CreateDateColumn()
  redeemedAt!: Date;
}
