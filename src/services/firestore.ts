import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  VipNumber,
  AppUser,
  Booking,
  ActivityLog,
  SearchFilters,
  DashboardStats,
  BookingStatus,
  NumberStatus,
} from '../types';
import { detectPatterns, generateBookingRef } from '../lib/utils';

// ─── Converters ────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val as string);
}

function numberFromDoc(doc: DocumentSnapshot): VipNumber {
  const d = doc.data()!;
  return {
    id: doc.id,
    number: d.number,
    iccid: d.iccid,
    circle: d.circle,
    category: d.category,
    purchasePrice: d.purchasePrice,
    sellingPrice: d.sellingPrice,
    gst: d.gst || 18,
    status: d.status,
    tags: d.tags || [],
    patterns: d.patterns || [],
    description: d.description,
    images: d.images || [],
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
    addedBy: d.addedBy,
    isActive: d.isActive !== false,
    views: d.views || 0,
    wishlistCount: d.wishlistCount || 0,
  };
}

function bookingFromDoc(doc: DocumentSnapshot): Booking {
  const d = doc.data()!;
  return {
    id: doc.id,
    numberId: d.numberId,
    customerName: d.customerName,
    customerPhone: d.customerPhone,
    customerUID: d.customerUID,
    status: d.status,
    bookingDate: toDate(d.bookingDate),
    notes: d.notes,
    handledBy: d.handledBy,
    totalAmount: d.totalAmount,
    gstAmount: d.gstAmount,
    invoiceUrl: d.invoiceUrl,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

function userFromDoc(doc: DocumentSnapshot): AppUser {
  const d = doc.data()!;
  return {
    uid: doc.id,
    name: d.name,
    phone: d.phone,
    email: d.email,
    role: d.role,
    wishlist: d.wishlist || [],
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
    isActive: d.isActive !== false,
    avatar: d.avatar,
  };
}

// ─── VIP Numbers ───────────────────────────────────────────────────────────────

export const numbersService = {
  async getAll(filters?: SearchFilters, pageSize = 20, lastDoc?: DocumentSnapshot) {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (filters?.category) constraints.push(where('category', '==', filters.category));
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    if (filters?.circle) constraints.push(where('circle', '==', filters.circle));

    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(pageSize));

    const q = query(collection(db, 'vip_numbers'), ...constraints);
    const snap = await getDocs(q);
    return {
      numbers: snap.docs.map(numberFromDoc),
      lastDoc: snap.docs[snap.docs.length - 1],
      hasMore: snap.docs.length === pageSize,
    };
  },

  async getById(id: string): Promise<VipNumber | null> {
    const ref = doc(db, 'vip_numbers', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    // Increment views
    await updateDoc(ref, { views: increment(1) });
    return numberFromDoc(snap);
  },

  async getFeatured(cat?: string): Promise<VipNumber[]> {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'Available'),
      orderBy('wishlistCount', 'desc'),
      limit(12),
    ];
    if (cat) constraints.unshift(where('category', '==', cat));
    const q = query(collection(db, 'vip_numbers'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(numberFromDoc);
  },

  async getNew(): Promise<VipNumber[]> {
    const q = query(
      collection(db, 'vip_numbers'),
      where('status', '==', 'Available'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const snap = await getDocs(q);
    return snap.docs.map(numberFromDoc);
  },

  async add(data: Omit<VipNumber, 'id' | 'createdAt' | 'updatedAt' | 'patterns'>, addedBy: string): Promise<string> {
    const patterns = detectPatterns(data.number);
    const ref = await addDoc(collection(db, 'vip_numbers'), {
      ...data,
      patterns,
      addedBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      views: 0,
      wishlistCount: 0,
    });
    await activityService.log('ADD_NUMBER', addedBy, ref.id, 'vip_number', { number: data.number });
    return ref.id;
  },

  async update(id: string, data: Partial<VipNumber>, updatedBy: string): Promise<void> {
    const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (data.number) updateData.patterns = detectPatterns(data.number);
    await updateDoc(doc(db, 'vip_numbers', id), updateData);
    await activityService.log('UPDATE_NUMBER', updatedBy, id, 'vip_number', data);
  },

  async delete(id: string, deletedBy: string): Promise<void> {
    await deleteDoc(doc(db, 'vip_numbers', id));
    await activityService.log('DELETE_NUMBER', deletedBy, id, 'vip_number');
  },

  async bulkImport(numbers: Omit<VipNumber, 'id' | 'createdAt' | 'updatedAt' | 'patterns'>[], addedBy: string): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;
    for (const num of numbers) {
      const ref = doc(collection(db, 'vip_numbers'));
      batch.set(ref, {
        ...num,
        patterns: detectPatterns(num.number),
        addedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        views: 0,
        wishlistCount: 0,
      });
      count++;
      if (count % 500 === 0) await batch.commit();
    }
    await batch.commit();
    await activityService.log('BULK_IMPORT', addedBy, '', 'vip_number', { count });
    return count;
  },

  subscribeToAll(callback: (numbers: VipNumber[]) => void) {
    const q = query(collection(db, 'vip_numbers'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snap) => callback(snap.docs.map(numberFromDoc)));
  },
};

// ─── Bookings ──────────────────────────────────────────────────────────────────

export const bookingsService = {
  async create(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'bookings'), {
      ...data,
      bookingRef: generateBookingRef(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Mark number as Reserved
    await updateDoc(doc(db, 'vip_numbers', data.numberId), {
      status: 'Reserved' as NumberStatus,
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateStatus(id: string, status: BookingStatus, numberId: string, handledBy: string): Promise<void> {
    await updateDoc(doc(db, 'bookings', id), { status, updatedAt: serverTimestamp(), handledBy });
    if (status === 'Completed') {
      await updateDoc(doc(db, 'vip_numbers', numberId), { status: 'Sold', updatedAt: serverTimestamp() });
    } else if (status === 'Cancelled') {
      await updateDoc(doc(db, 'vip_numbers', numberId), { status: 'Available', updatedAt: serverTimestamp() });
    }
    await activityService.log('UPDATE_BOOKING', handledBy, id, 'booking', { status });
  },

  async getAll(): Promise<Booking[]> {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(bookingFromDoc);
  },

  async getByCustomer(uid: string): Promise<Booking[]> {
    const q = query(
      collection(db, 'bookings'),
      where('customerUID', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(bookingFromDoc);
  },

  subscribeToAll(callback: (bookings: Booking[]) => void) {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => callback(snap.docs.map(bookingFromDoc)));
  },
};

// ─── Users ─────────────────────────────────────────────────────────────────────

export const usersService = {
  async getById(uid: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return userFromDoc(snap);
  },

  async create(uid: string, data: Omit<AppUser, 'uid'>): Promise<void> {
    await doc(db, 'users', uid);
    await updateDoc(doc(db, 'users', uid), {}).catch(() =>
      addDoc(collection(db, 'users'), { uid, ...data, createdAt: serverTimestamp() })
    );
  },

  async upsert(uid: string, data: Partial<AppUser>): Promise<void> {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } else {
      await import('firebase/firestore').then(({ setDoc }) =>
        setDoc(ref, { uid, ...data, createdAt: serverTimestamp(), wishlist: [], isActive: true })
      );
    }
  },

  async getAll(): Promise<AppUser[]> {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(userFromDoc);
  },

  async getByRole(role: string): Promise<AppUser[]> {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snap = await getDocs(q);
    return snap.docs.map(userFromDoc);
  },

  async toggleWishlist(uid: string, numberId: string, add: boolean): Promise<void> {
    const ref = doc(db, 'users', uid);
    const numRef = doc(db, 'vip_numbers', numberId);
    const batch = writeBatch(db);
    const { arrayUnion, arrayRemove } = await import('firebase/firestore');
    batch.update(ref, { wishlist: add ? arrayUnion(numberId) : arrayRemove(numberId) });
    batch.update(numRef, { wishlistCount: increment(add ? 1 : -1) });
    await batch.commit();
  },
};

// ─── Activity Logs ─────────────────────────────────────────────────────────────

export const activityService = {
  async log(action: string, performedBy: string, targetId: string, targetType?: string, details?: Record<string, unknown>): Promise<void> {
    await addDoc(collection(db, 'activity_logs'), {
      action,
      performedBy,
      targetId,
      targetType,
      details,
      timestamp: serverTimestamp(),
    });
  },

  async getAll(limitCount = 50): Promise<ActivityLog[]> {
    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      action: d.data().action,
      performedBy: d.data().performedBy,
      performedByName: d.data().performedByName || '',
      targetId: d.data().targetId,
      targetType: d.data().targetType,
      timestamp: toDate(d.data().timestamp),
      details: d.data().details,
    }));
  },
};

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [numbersSnap, bookingsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'vip_numbers')),
      getDocs(collection(db, 'bookings')),
      getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
    ]);

    const numbers = numbersSnap.docs.map((d) => d.data());
    const bookings = bookingsSnap.docs.map((d) => d.data());

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyBookings = bookings.filter((b) => {
      const date = toDate(b.createdAt);
      return date >= monthStart && b.status === 'Completed';
    });

    return {
      totalNumbers: numbers.length,
      availableNumbers: numbers.filter((n) => n.status === 'Available').length,
      soldNumbers: numbers.filter((n) => n.status === 'Sold').length,
      reservedNumbers: numbers.filter((n) => n.status === 'Reserved').length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'Pending').length,
      totalRevenue: bookings
        .filter((b) => b.status === 'Completed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      monthlyRevenue: monthlyBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      totalCustomers: usersSnap.size,
    };
  },
};
