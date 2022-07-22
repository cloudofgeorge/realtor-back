import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SignInParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private static generateJWT(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      },
    );
  }

  async signup(
    { email, password, name, phone }: SignUpParams,
    userType: UserType,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        phone,
        password: hashPassword,
        user_type: userType,
      },
    });

    return await AuthService.generateJWT(user.name, user.id);
  }

  async signin({ email, password }: SignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    const throwInvalidCredentials = (): HttpException => {
      throw new HttpException('Invalid credentials', 400);
    };

    if (!user) {
      throwInvalidCredentials();
    }

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throwInvalidCredentials();
    }

    return await AuthService.generateJWT(user.name, user.id);
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(string, 10);
  }
}
