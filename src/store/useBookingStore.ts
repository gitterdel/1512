import { create } from 'zustand';
import { Booking } from '../types';

interface BookingState {
  bookings: Booking[];
  activeBooking: Booking | null;
  setActiveBooking: (booking: Booking | null) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [{
    id: '1',
    propertyId: '1',
    tenantId: '1',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'confirmed',
    totalPrice: 800,
    paymentStatus: 'paid',
    createdAt: new Date(),
  }],
  activeBooking: null,
  setActiveBooking: (booking) => set({ activeBooking: booking }),
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (bookingId, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ),
    })),
  cancelBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ),
    })),
}));