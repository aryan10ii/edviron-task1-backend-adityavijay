import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeeBill, FeeBillStatus } from './fee-bill.entity';
import { Repository } from 'typeorm';
import { CreateFeeBillDto } from './dto/create-fee-bill.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeBill) private readonly repo: Repository<FeeBill>,
    private studentsService: StudentsService,
  ) {}

  async create(dto: CreateFeeBillDto) {
    const student = await this.studentsService.findById(dto.studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const entity = this.repo.create({
      student,
      dueDate: dto.dueDate,
      amountTotal: dto.amountTotal,
      currency: dto.currency,
      status: dto.status ?? FeeBillStatus.PENDING,
    });
    return this.repo.save(entity);
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['student'] });
  }

  async updateStatus(id: string, status: FeeBillStatus) {
    const fee = await this.findById(id);
    if (!fee) throw new NotFoundException('Fee bill not found');
    fee.status = status;
    return this.repo.save(fee);
  }
}
