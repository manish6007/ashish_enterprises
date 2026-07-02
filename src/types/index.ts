// TypeScript types for the entire application

export type UserRole = 'admin' | 'staff' | 'customer';

export type NumberCategory = 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type NumberStatus = 'Available' | 'Reserved' | 'Sold';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export type NumberPattern =
  | '786'
  | '9999'
  | '5555'
  | '1234'
  | '0000'
  | 'ABCD'
  | 'AABB'
  | 'AAAB'
  | 'Mirror'
  | 'Fancy'
  | 'Repeating';

export interface AppUser {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  wishlist: string[];
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  avatar?: string;
}

export interface VipNumber {
  id: string;
  number: string; // 10-digit mobile number
  iccid?: string;
  circle: string;
  category: NumberCategory;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  status: NumberStatus;
  tags: string[];
  patterns: NumberPattern[];
  description?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  addedBy: string;
  isActive: boolean;
  views?: number;
  wishlistCount?: number;
}

export interface Booking {
  id: string;
  numberId: string;
  number?: VipNumber;
  customerName: string;
  customerPhone: string;
  customerUID?: string;
  status: BookingStatus;
  bookingDate: Date;
  notes?: string;
  handledBy?: string;
  totalAmount: number;
  gstAmount: number;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  uid: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  permissions: {
    canAddNumbers: boolean;
    canEditNumbers: boolean;
    canDeleteNumbers: boolean;
    canManageBookings: boolean;
    canViewReports: boolean;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  targetId?: string;
  targetType?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  discount?: number;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  category?: NumberCategory | '';
  status?: NumberStatus | '';
  patterns?: NumberPattern[];
  minPrice?: number;
  maxPrice?: number;
  circle?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface DashboardStats {
  totalNumbers: number;
  availableNumbers: number;
  soldNumbers: number;
  reservedNumbers: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
}
