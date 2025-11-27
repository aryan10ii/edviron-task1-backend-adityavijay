import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionStatus, PaymentMethod } from './transaction.entity';
import { Repository } from 'typeorm';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { AuthUserPayload } from '../common/decorators/user.decorator';
import { FeeBillStatus } from '../fees/fee-bill.entity';
import { FeesService } from '../fees/fees.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
    private readonly feesService: FeesService,
  ) {}

  async list(dto: ListTransactionsDto, user: AuthUserPayload) {
    const { page = 1, limit = 20, status, paymentMethod, studentName } = dto;

    const qb = this.repo
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.student', 'student')
      .leftJoinAndSelect('txn.feeBill', 'feeBill');

    if (user.role !== 'SUPER_ADMIN') {
      qb.andWhere('student.schoolId = :schoolId', { schoolId: user.schoolId });
    }

    if (status) {
      qb.andWhere('txn.status = :status', { status });
    }
    if (paymentMethod) {
      qb.andWhere('txn.paymentMethod = :paymentMethod', { paymentMethod });
    }
    if (studentName) {
      qb.andWhere('LOWER(student.name) LIKE :name', {
        name: `%${studentName.toLowerCase()}%`,
      });
    }

    qb.orderBy('txn.processedAt', 'DESC').addOrderBy('txn.createdAt', 'DESC');

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async recordTransaction(params: {
    feeBillId: string;
    amount: string;
    paymentMethod: PaymentMethod;
    status: TransactionStatus;
    gatewayTxnId?: string;
    failureReason?: string | null;
  }) {
    const feeBill = await this.feesService.findById(params.feeBillId);
    if (!feeBill) {
      throw new Error('Fee bill not found');
    }

    const txn = this.repo.create({
      feeBill,
      student: feeBill.student,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      status: params.status,
      gatewayTxnId: params.gatewayTxnId ?? null,
      failureReason: params.failureReason ?? null,
      processedAt: new Date(),
    });
    const saved = await this.repo.save(txn);

    if (params.status === TransactionStatus.SUCCESS) {
      const successfulTxns = await this.repo.find({
        where: { feeBill: { id: feeBill.id }, status: TransactionStatus.SUCCESS },
      });
      const paidTotal = successfulTxns.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0,
      );
      const billAmount = parseFloat(feeBill.amountTotal);
      if (paidTotal >= billAmount) {
        await this.feesService.updateStatus(feeBill.id, FeeBillStatus.PAID);
      } else if (paidTotal > 0) {
        await this.feesService.updateStatus(
          feeBill.id,
          FeeBillStatus.PARTIALLY_PAID,
        );
      }
    }

    return saved;
  }
}
