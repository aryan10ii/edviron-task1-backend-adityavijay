import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeeBill } from '../fees/fee-bill.entity';
import { Student } from '../students/student.entity';

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
}

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FeeBill, (fee) => fee.transactions, { eager: true })
  @Index()
  feeBill: FeeBill;

  @ManyToOne(() => Student, { eager: true })
  @Index()
  student: Student;

  @Index()
  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'gateway_txn_id', nullable: true })
  gatewayTxnId: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Index()
  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Index()
  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
