import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { AuthUser } from '../common/decorators/user.decorator';
import { AuthUserPayload } from '../common/decorators/user.decorator';
import { PaymentMethod, TransactionStatus } from './transaction.entity';

class RecordTransactionBody {
  feeBillId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  gatewayTxnId?: string;
  failureReason?: string | null;
}

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT, UserRole.DEVELOPER)
  async list(
    @Query() dto: ListTransactionsDto,
    @AuthUser() user: AuthUserPayload,
  ) {
    return this.transactionsService.list(dto, user);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  async record(@Body() body: RecordTransactionBody) {
    return this.transactionsService.recordTransaction(body);
  }
}
