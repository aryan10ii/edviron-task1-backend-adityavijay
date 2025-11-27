import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { SummaryFiltersDto } from './dto/summary-filters.dto';
import { AuthUser } from '../common/decorators/user.decorator';
import { AuthUserPayload } from '../common/decorators/user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  async getSummary(
    @Query() filters: SummaryFiltersDto,
    @AuthUser() user: AuthUserPayload,
  ) {
    return this.reportsService.getSummary(filters, user);
  }
}
