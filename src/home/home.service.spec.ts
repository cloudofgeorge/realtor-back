import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { CreateHomeParams } from './types';

const mockGetHomes = [
  {
    id: 1,
    address: '123 Main St',
    city: 'New York',
    price: 100000,
    property_type: PropertyType.APARTMENT,
    image: 'src/1.jpg',
    number_of_bathrooms: 2,
    number_of_bedrooms: 3,
    images: [
      {
        url: 'src/1.jpg',
      },
    ],
  },
];

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

const mockImages = [
  {
    id: 1,
    url: 'src/1.jpg',
  },
  {
    id: 2,
    url: 'src/2.jpg',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue([]),
              create: jest.fn().mockReturnValue(mockHome[0]),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'New York',
      price: {
        gte: 100000,
        lte: 200000,
      },
      propertyType: PropertyType.APARTMENT,
    };

    it('should return prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes({});

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          id: true,
          address: true,
          city: true,
          price: true,
          property_type: true,
          number_of_bathrooms: true,
          number_of_bedrooms: true,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: {},
      });
    });

    it('should throw error if no homes found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrow('No homes found');
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams: CreateHomeParams = {
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

    it('should call prisma home.create with the correct params', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '123 Main St',
          city: 'New York',
          number_of_bedrooms: 3,
          number_of_bathrooms: 2,
          land_size: 100,
          price: 300000,
          property_type: PropertyType.APARTMENT,
          realtor_id: 5,
        },
      });
    });

    it('should call prisma image.createMany with correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);
      const mockCreateManyImages = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImages);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateManyImages).toBeCalledWith({
        data: [
          {
            home_id: 1,
            url: 'src/1.jpg',
          },
        ],
      });
    });
  });
});
