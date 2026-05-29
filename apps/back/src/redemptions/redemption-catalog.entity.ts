import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type RedemptionCategory =
  | 'insumos'
  | 'educacion'
  | 'universidad'
  | 'otro';

// Aliados y descuentos donde canjear CivicCoins (Diferenciador 2).
@Entity('redemption_catalog')
export class RedemptionCatalog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  partner!: string;

  @Column()
  description!: string;

  @Column('int')
  pointsCost!: number;

  @Column()
  category!: RedemptionCategory;

  @Column('int', { nullable: true })
  discount!: number | null; // porcentaje
}
