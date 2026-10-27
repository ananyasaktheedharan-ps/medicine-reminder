import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginInput, RegisterInput } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  private token(user: { id: string; email: string }) {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }

  async register(input: RegisterInput) {
    if (await this.users.findByEmail(input.email)) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(input.password, 10);
    const user = await this.users.create(input.email, input.name, hash);
    return { accessToken: this.token(user), user };
  }

  async login(input: LoginInput) {
    const user = await this.users.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { accessToken: this.token(user), user };
  }
}
