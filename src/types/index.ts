export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'house' | 'room';
  landlordId: string;
  images: string[];
  features: {
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    furnished: boolean;
    petsAllowed: boolean;
  };
  amenities?: string[];
  status: 'available' | 'reserved' | 'rented' | 'pending' | 'verified' | 'hidden';
  createdAt: Date;
  updatedAt?: Date;
  verified: boolean;
  verifiedAt?: Date;
  hidden: boolean;
  views: number;
  rating?: number;
  featured?: boolean;
}