import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Student } from './students/student.entity';
import { FeeBill, FeeBillStatus } from './fees/fee-bill.entity';
import { Transaction, PaymentMethod, TransactionStatus } from './transactions/transaction.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './common/enums/role.enum';

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, Student, FeeBill, Transaction],
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const studentRepo = dataSource.getRepository(Student);
  const feeRepo = dataSource.getRepository(FeeBill);
  const txnRepo = dataSource.getRepository(Transaction);

  let admin = await userRepo.findOne({ where: { email: 'admin@edviron.local' } });
  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    admin = userRepo.create({
      email: 'admin@edviron.local',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      schoolId: null,
    });
    await userRepo.save(admin);
    console.log('Created SUPER_ADMIN user: admin@edviron.local / Admin@123');
  } else {
    console.log('SUPER_ADMIN user already exists');
  }

  const schoolId = '11111111-1111-1111-1111-111111111111';

  const s1 = studentRepo.create({
    schoolId,
    rollNumber: '10A-01',
    name: 'Alice',
    class: '10',
    section: 'A',
    phone: '9999999999',
    email: 'alice@example.com',
  });

  const s2 = studentRepo.create({
    schoolId,
    rollNumber: '10A-02',
    name: 'Bob',
    class: '10',
    section: 'A',
    phone: '8888888888',
    email: 'bob@example.com',
  });

  await studentRepo.save([s1, s2]);

  const f1 = feeRepo.create({
    student: s1,
    dueDate: '2025-03-31',
    amountTotal: '50000',
    currency: 'INR',
    status: FeeBillStatus.PENDING,
  });

  const f2 = feeRepo.create({
    student: s2,
    dueDate: '2025-03-31',
    amountTotal: '50000',
    currency: 'INR',
    status: FeeBillStatus.PENDING,
  });

  await feeRepo.save([f1, f2]);

  const t1 = txnRepo.create({
    feeBill: f1,
    student: s1,
    amount: '30000',
    paymentMethod: PaymentMethod.UPI,
    status: TransactionStatus.SUCCESS,
    gatewayTxnId: 'GW123',
    processedAt: new Date(),
  });

  const t2 = txnRepo.create({
    feeBill: f2,
    student: s2,
    amount: '50000',
    paymentMethod: PaymentMethod.CARD,
    status: TransactionStatus.SUCCESS,
    gatewayTxnId: 'GW124',
    processedAt: new Date(),
  });

  await txnRepo.save([t1, t2]);

  console.log('Seed data inserted');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
