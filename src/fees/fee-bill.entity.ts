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
import { Student } from '../students/student.entity';
import { Transaction } from '../transactions/transaction.entity';

export enum FeeBillStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity({ name: 'fee_bills' })
export class FeeBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.feeBills, { eager: true })
  @Index()
  student: Student;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'amount_total', type: 'numeric', precision: 12, scale: 2 })
  amountTotal: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: FeeBillStatus, default: FeeBillStatus.PENDING })
  status: FeeBillStatus;

  @OneToMany(() => Transaction, (txn) => txn.feeBill)
  transactions: Transaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
