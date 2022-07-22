import { PropertyType } from '@prisma/client';

export interface GetHomeParams {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface Image {
  url: string;
}

export interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: Image[];
}

export interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}
