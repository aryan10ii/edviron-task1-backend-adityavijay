import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { FeesModule } from './fees/fees.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Student } from './students/student.entity';
import { FeeBill } from './fees/fee-bill.entity';
import { Transaction } from './transactions/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [User, Student, FeeBill, Transaction],
        synchronize: true, // ok for assignment/demo, not for production
      }),
    }),
    UsersModule,
    AuthModule,
    StudentsModule,
    FeesModule,
    TransactionsModule,
    ReportsModule,
  ],
})
export class AppModule {}
