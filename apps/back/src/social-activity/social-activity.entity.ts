import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type SocialActivityCategory = 'enseñanza' | 'voluntariado' | 'obra';

// Catálogo de actividades sociales que otorgan CivicCoins (Diferenciador 2).
@Entity('social_activities')
export class SocialActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column('int')
  pointsReward!: number;

  @Column()
  category!: SocialActivityCategory;

  @Column()
  barrio!: string;

  // Habilidades necesarias para aportar en la actividad (FK lógica a skills).
  @Column('uuid', { array: true, default: [] })
  requiredSkillIds!: string[];
}
