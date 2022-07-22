import {
  Controller,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, GenerateProductKeyDTO } from '../dtos/auth.dto';
import { User } from '../decorators/user.decorator';
import { JWTPayload } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  async signup(
    @Body() body: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException('Product key is required');
      }

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isValidProductKey) {
        throw new UnauthorizedException('Invalid product key');
      }
    }

    return this.authService.signup(body, userType);
  }

  @Post('/signin')
  signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() { userType, email }: GenerateProductKeyDTO) {
    return this.authService.generateProductKey(email, userType);
  }

  @Get('/me')
  getMe(@User() user: JWTPayload) {
    return user;
  }
}
