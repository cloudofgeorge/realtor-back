import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { JWTPayload } from '../user/types';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 53,
  name: 'test',
  email: 'test@test.com',
  phone: '555 555 5555',
};

const mockHome = {
  id: 1,
  address: '123 Main St',
  city: 'New York',
  price: 100000,
  property_type: PropertyType.APARTMENT,
  image: 'src/1.jpg',
  number_of_bathrooms: 2,
  number_of_bedrooms: 3,
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', PropertyType.APARTMENT, 100, 200);

      expect(mockGetHomes).toBeCalledWith({
        city: 'Toronto',
        price: {
          gte: 100,
          lte: 200,
        },
        propertyType: PropertyType.APARTMENT,
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo: JWTPayload = {
      name: 'test',
      id: 44,
      iat: 1,
      exp: 1,
    };

    const mockUpdateHomeParams = {
      address: '123 Main St',
      city: 'New York',
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      price: 300000,
      landSize: 100,
      propertyType: PropertyType.APARTMENT,
      images: [
        {
          url: 'src/1.jpg',
        },
      ],
    };

    it('should throw unauthorized error if user is not logged in', async () => {
      await expect(
        controller.updateHome(1, mockUpdateHomeParams, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if realtor is logged in', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(1, mockUpdateHomeParams, {
        ...mockUserInfo,
        id: 53,
      });

      await expect(mockUpdateHome).toBeCalled();
    });
  });
});
