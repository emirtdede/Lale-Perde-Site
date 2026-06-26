// Database Type Interfaces for Lale Perde

export interface Product {
  id: string;
  nameTr: string;
  nameEn: string;
  categoryTr: string;
  categoryEn: string;
  categoryId: string;
  descriptionTr: string;
  descriptionEn: string;
  colors: { nameTr: string; nameEn: string; hex: string }[];
  fabricTypeTr: string;
  fabricTypeEn: string;
  priceMultiplier: number; // For custom price calculation: width * height * priceMultiplier
  popularity: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  techSpecsTr: string[];
  techSpecsEn: string[];
  status: 'active' | 'draft' | 'archived'; // archived means hidden from client but visible in admin archive
  coverImage?: string;
  displayOrder: number;
  curtainTypeId?: string;
  fabricTypeId?: string;
  mountingTypeIds?: string[];
}

export interface MountingType {
  id: string;
  categoryId: string;
  curtainTypeId?: string;
  nameTr: string;
  nameEn: string;
  descriptionTr?: string;
  descriptionEn?: string;
  displayOrder: number;
  status: 'active' | 'passive';
}

export interface Category {
  id: string;
  nameTr: string;
  nameEn: string;
  image: string;
  images?: string[];
  status: 'active' | 'passive';
  displayOrder: number;
  descriptionTr?: string;
  descriptionEn?: string;
  slug?: string;
  carouselOrder?: number;
}

export interface CurtainType {
  id: string;
  categoryId: string;
  nameTr: string;
  nameEn: string;
  slug: string;
  displayOrder: number;
  status: 'active' | 'passive';
}

export interface FabricType {
  id: string;
  categoryId: string;
  nameTr: string;
  nameEn: string;
  slug: string;
  displayOrder: number;
  status: 'active' | 'passive';
}

export interface SystemSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;
  googleMapsEmbed: string;
  announcementTr: string;
  announcementEn: string;
  announcementActive: boolean;
  workingHoursTr: string;
  workingHoursEn: string;
  adminUsername: string;
  adminPasswordHash: string; // Plain password
  adminPhone: string;
  adminEmail: string;
  googleAdsId?: string;
  adsLabelWhatsapp?: string;
  adsLabelContact?: string;
  twoFactorEnabled?: boolean;
  twoFactorType?: 'email' | 'phone' | 'both';
  emailSendCount?: number;
  lastEmailSendDate?: string;
  shopierUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  campaignInterval?: number;
  logoConfig?: {
    theme: 'gold' | 'ruby' | 'emerald' | 'sapphire';
    interactionRadius: number;
    returnSpeed: number;
    friction: number;
    scatterPower: number;
  };
}

export interface HomePageContent {
  philosophyTitleTr: string;
  philosophyTitleEn: string;
  philosophyDescTr: string;
  philosophyDescEn: string;
  craftTitleTr: string;
  craftTitleEn: string;
  craftDescTr: string;
  craftDescEn: string;
  collectionsTitleTr: string;
  collectionsTitleEn: string;
  collectionsDescTr: string;
  collectionsDescEn: string;
  featuredCategoryIds?: string[];
  references?: {
    layoutType: string;
    items: {
      id: string;
      image: string;
      titleTr: string;
      titleEn: string;
      descriptionTr: string;
      descriptionEn: string;
      gridColumnStart?: number;
      gridColumnEnd?: number;
      gridRowStart?: number;
      gridRowEnd?: number;
    }[];
  };
}

export interface ServiceItem {
  id: string;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  icon: string;
  displayOrder: number;
  status: 'active' | 'passive';
  image?: string;
  images?: string[];
  focalX?: number;
  focalY?: number;
}

export interface GuideItem {
  id: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  contentTr: string;
  contentEn: string;
  image: string;
  date: string;
  status: 'active' | 'passive';
  displayOrder: number;
}

export interface InboxMessage {
  id: string;
  type: 'lead' | 'appointment' | 'contact';
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
  isResolved: boolean;
  isArchived: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  address?: string;
}

export interface Campaign {
  id: string;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  displayOrder?: number;
  duration?: number;
}


export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Won' | 'Lost';
  lostReason?: string;
  dwellTime?: number; // duration user spent on page (sec) to calculate quality score
  score?: number; // 0-100 quality score
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  date: string;
  timeSlot: string;
  status: 'New' | 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface SearchLog {
  query: string;
  count: number;
}

export interface VisitorLog {
  id: string;
  city: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  duration: number; // seconds spent
  isBot: boolean;
}
