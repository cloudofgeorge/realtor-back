import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PropertyType, UserType } from '@prisma/client';
import { HomeService } from './home.service';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireHomeDto,
  UpdateHomeDto,
} from './dtos/home.dto';
import { User } from '../user/decorators/user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { JWTPayload } from '../user/types';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('propertyType') propertyType?: PropertyType,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minBedrooms') minBedrooms?: number,
    @Query('maxBedrooms') maxBedrooms?: number,
    @Query('minBathrooms') minBathrooms?: number,
    @Query('maxBathrooms') maxBathrooms?: number,
    @Query('minLandSize') minLandSize?: number,
    @Query('maxLandSize') maxLandSize?: number,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice }),
          }
        : null;

    const filters = {
      ...(city && { city: city }),
      ...(price && { price }),
      ...(propertyType && { propertyType: propertyType }),
    };

    return this.homeService.getHomes(filters);
  }

  @Get('/:id')
  getHomeById(@Param('id') id: number) {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: JWTPayload) {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Put('/:id')
  async updateHome(
    @Param('id', ParseIntPipe) homeId: number,
    @Body() body: UpdateHomeDto,
    @User() user: JWTPayload,
  ) {
    const home = await this.homeService.getRealtorByHomeId(homeId);

    if (home.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.updateHomeById(homeId, body);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Delete('/:id')
  async deleteHome(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: JWTPayload,
  ) {
    const home = await this.homeService.getRealtorByHomeId(homeId);

    if (home.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.deleteHomeById(homeId);
  }

  @Roles(UserType.BUYER)
  @Post('/:id/inquire')
  async inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: JWTPayload,
    @Body() { message }: InquireHomeDto,
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @Roles(UserType.ADMIN, UserType.REALTOR)
  @Get('/:id/messages')
  async getHomeMessages(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: JWTPayload,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(homeId);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.getHomeMessages(homeId);
  }
}
