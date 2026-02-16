// User types
export type UserRole = 'super_admin' | 'admin';

export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  websiteId?: string;
  websiteName?: string;
  websiteAccess: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Room type (embedded in Website)
export type BedType = 'Single' | 'Double' | 'Queen' | 'King' | 'Twin' | 'Suite' | 'Bunk';

export interface Room {
  _id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedType: BedType;
  size: number;
  basePrice: number;
  mainImage: string;
  discountPercentage?: string;
  detailImages: string[];
  images: string[];
  amenities: string[];
  features: string[];
  servicesIncluded: string[];
  isAvailable: boolean;
}

// Site Settings type
export interface SiteSettings {
  logo: string;
  footerLogo: string;
  footerDescription: string;
}

// Hero Section type (embedded in Website)
export type HeroPageType = 'home' | 'facilities' | 'about' | 'contact' | 'room' | 'roomdetails' | 'location' | 'dining';

export interface HeroSection {
  _id: string;
  page: HeroPageType;
  image: string;
  text: string;
  subText: string;
  isActive: boolean;
}

// Our Story type (single embedded object in Website)
export interface OurStory {
  title: string;
  subTitle: string;
  percentage: string;
  suites: string;
  images: string[];
}

// Facility type (embedded in Website)
export interface Facility {
  _id: string;
  image: string;
  title: string;
  subTitle: string;
}

// Review type (embedded in Website)
export interface Review {
  _id: string;
  avatar: string;
  name: string;
  review: string;
  rating: number;
}

// Website types (single document with everything embedded)
export interface Website {
  _id: string;
  uniqueId: string;
  name: string;
  domain: string;
  subdomain: string;
  theme: string;
  hotelInfo: {
    title: string;
    description: string;
    contact: {
      phone: string;
      email: string;
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    socialLinks: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
    images: {
      banner: string;
      logo: string;
      gallery: string[];
    };
    amenities: string[];
    nearbyAttractions: Array<{
      name: string;
      distance: string;
      type: string;
    }>;
    transportLinks: Array<{
      name: string;
      distance: string;
      type: string;
    }>;
  };
  rooms: Room[];
  heroSections: HeroSection[];
  ourStory: OurStory;
  facilities: Facility[];
  reviews: Review[];
  siteSettings: SiteSettings;
  assignedAdmin?: {
    _id: string;
    name: string;
    email: string;
  };
  settings: {
    language: string;
    currency: string;
    timezone: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}
