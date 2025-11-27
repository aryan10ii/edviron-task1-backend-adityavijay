import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
import { UserRole } from '../enums/role.enum';

@Injectable()
export class FieldFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      map((data) => {
        if (!user) return data;
        return this.applyFieldRules(user.role, data);
      }),
    );
  }

  private applyFieldRules(role: UserRole, data: any): any {
    if (!data) return data;

    if (role === UserRole.DEVELOPER) {
      // Developer should not see student PII but can see failure_reason
      const scrubPiI = (item: any) => {
        if (!item) return item;
        if (item.student) {
          const { phone, email, ...restStudent } = item.student;
          item.student = restStudent;
        }
        return item;
      };
      if (Array.isArray(data)) {
        return data.map(scrubPiI);
      }
      if (data.items && Array.isArray(data.items)) {
        data.items = data.items.map(scrubPiI);
        return data;
      }
      return scrubPiI(data);
    }

    if (role === UserRole.ACCOUNTANT) {
      // Accountant should not see failure_reason details
      const scrubFailure = (item: any) => {
        if (!item) return item;
        if ('failure_reason' in item) {
          item.failure_reason = undefined;
        }
        return item;
      };
      if (Array.isArray(data)) {
        return data.map(scrubFailure);
      }
      if (data.items && Array.isArray(data.items)) {
        data.items = data.items.map(scrubFailure);
        return data;
      }
      return scrubFailure(data);
    }

    // SUPER_ADMIN and SCHOOL_ADMIN see everything
    return data;
  }
}
