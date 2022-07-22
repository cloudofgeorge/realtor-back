import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class HomeModule {}
