import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeeBill } from '../fees/fee-bill.entity';

@Entity({ name: 'students' })
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'roll_number', nullable: true })
  rollNumber: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @OneToMany(() => FeeBill, (fee) => fee.student)
  feeBills: FeeBill[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
