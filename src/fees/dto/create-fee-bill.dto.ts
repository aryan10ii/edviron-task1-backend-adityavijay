import { IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { FeeBillStatus } from '../fee-bill.entity';

export class CreateFeeBillDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsDateString()
  dueDate: string;

  @IsNumberString()
  amountTotal: string;

  @IsString()
  currency: string;

  @IsEnum(FeeBillStatus)
  status: FeeBillStatus;
}
