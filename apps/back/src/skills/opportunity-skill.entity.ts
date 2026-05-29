import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Habilidades vinculadas a cada oportunidad. En empleos representan requisitos
// (required = true); en cursos/estudios, las que la oportunidad desarrolla
// (required = false) y que sirven para cerrar brechas en una ruta.
@Entity('opportunity_skills')
@Index(['opportunityId', 'skillId'], { unique: true })
export class OpportunitySkill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  opportunityId!: string;

  @Column('uuid')
  skillId!: string;

  @Column({ default: true })
  required!: boolean;
}
