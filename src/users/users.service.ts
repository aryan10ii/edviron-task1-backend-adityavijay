import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async createSuperAdminIfNotExists() {
    const existing = await this.findByEmail('admin@edviron.local');
    if (existing) return existing;
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const user = this.repo.create({
      email: 'admin@edviron.local',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      schoolId: null,
    });
    return this.repo.save(user);
  }
}
