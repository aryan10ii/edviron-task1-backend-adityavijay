import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeeBill } from '../fees/fee-bill.entity';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../transactions/transaction.entity';
import { SummaryFiltersDto } from './dto/summary-filters.dto';
import { AuthUserPayload } from '../common/decorators/user.decorator';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FeeBill)
    private readonly feeRepo: Repository<FeeBill>,
    @InjectRepository(Transaction)
    private readonly txnRepo: Repository<Transaction>,
  ) {}

  async getSummary(filters: SummaryFiltersDto, user: AuthUserPayload) {
    const { from, to, schoolId, class: className, section, paymentMethod } =
      filters;

    const qb = this.feeRepo
      .createQueryBuilder('fee')
      .innerJoin('fee.student', 'student')
      .leftJoin('fee.transactions', 'txn', 'txn.status = :success', {
        success: TransactionStatus.SUCCESS,
      });

    if (user.role !== 'SUPER_ADMIN') {
      qb.andWhere('student.schoolId = :schoolId', {
        schoolId: user.schoolId,
      });
    } else if (schoolId) {
      qb.andWhere('student.schoolId = :schoolId', { schoolId });
    }

    if (from && to) {
      qb.andWhere('fee.dueDate BETWEEN :from AND :to', { from, to });
    }

    if (className) {
      qb.andWhere('student.class = :className', { className });
    }

    if (section) {
      qb.andWhere('student.section = :section', { section });
    }

    if (paymentMethod) {
      qb.andWhere('txn.paymentMethod = :paymentMethod', { paymentMethod });
    }

    const totalExpectedRow = await qb
      .clone()
      .select('SUM(fee.amountTotal)', 'sum')
      .getRawOne();
    const totalCollectedRow = await qb
      .clone()
      .select('SUM(txn.amount)', 'sum')
      .getRawOne();

    const totalExpected = parseFloat(totalExpectedRow.sum || '0');
    const totalCollected = parseFloat(totalCollectedRow.sum || '0');

    const byPaymentMethod = await qb
      .clone()
      .select('txn.paymentMethod', 'paymentMethod')
      .addSelect('SUM(txn.amount)', 'amount')
      .groupBy('txn.paymentMethod')
      .getRawMany();

    const byClass = await qb
      .clone()
      .select('student.class', 'class')
      .addSelect('SUM(fee.amountTotal)', 'expected')
      .addSelect('COALESCE(SUM(txn.amount), 0)', 'collected')
      .groupBy('student.class')
      .getRawMany();

    return {
      total_fees_expected: totalExpected,
      total_fees_collected: totalCollected,
      total_pending: totalExpected - totalCollected,
      by_payment_method: byPaymentMethod.map((row) => ({
        method: row.paymentMethod,
        amount: parseFloat(row.amount),
      })),
      by_class: byClass.map((row) => ({
        class: row.class,
        expected: parseFloat(row.expected),
        collected: parseFloat(row.collected),
      })),
    };
  }
}
