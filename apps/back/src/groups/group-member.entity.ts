import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Membresía de un joven en un grupo social (Mi Sangre).
@Entity('group_members')
@Index(['groupId', 'youngId'], { unique: true })
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  groupId!: string;

  @Column('uuid')
  youngId!: string;

  @CreateDateColumn()
  joinedAt!: Date;
}
