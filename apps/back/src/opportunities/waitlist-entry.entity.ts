import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Lista de espera: cuando un joven hace "Me interesa" pero la oportunidad ya no
// tiene cupos, su intención se registra acá en vez de perderse. Es la señal de
// demanda real insatisfecha que alimenta el dashboard del SENA para decidir si
// abrir nuevos cursos/cupos.
@Entity('waitlist_entries')
@Index(['opportunityId', 'youngId'], { unique: true })
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  opportunityId!: string;

  @Column('uuid')
  youngId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
