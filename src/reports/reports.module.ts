import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeBill } from '../fees/fee-bill.entity';
import { Transaction } from '../transactions/transaction.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeeBill, Transaction])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
