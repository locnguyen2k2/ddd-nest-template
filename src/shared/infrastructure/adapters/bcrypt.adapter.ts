import { BcryptPort } from '@/shared/application/ports/bcrypt.port';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptAdapter implements BcryptPort {
  hashPassword(password: string, salt?: number): string {
    return bcrypt.hashSync(password, salt || 10);
  }
  comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}