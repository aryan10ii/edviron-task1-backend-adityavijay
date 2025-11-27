import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private readonly repo: Repository<Student>,
  ) {}

  create(dto: CreateStudentDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
