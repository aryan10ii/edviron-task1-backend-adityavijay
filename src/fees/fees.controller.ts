import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeBillDto } from './dto/create-fee-bill.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private feesService: FeesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  create(@Body() dto: CreateFeeBillDto) {
    return this.feesService.create(dto);
  }
}
