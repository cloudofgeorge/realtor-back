import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsEmail,
  MinLength,
  Matches,
  IsOptional,
  IsPassportNumber,
  IsEnum,
} from 'class-validator';
import { UserType } from '@prisma/client';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey: string;

  @IsOptional()
  @Matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/, {
    message: 'Invalid phone number',
  })
  phone: string;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class GenerateProductKeyDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;
}
