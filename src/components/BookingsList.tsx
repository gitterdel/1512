import React from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';

export const BookingsList = () => {
  const { bookings } = useBookingStore();
  const { user } = useAuthStore();
  const { properties } = usePropertyStore();

  if (!user) return null;

  const userBookings = bookings.filter(booking => booking.tenantId === user.id);

  const getPropertyDetails = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  if (userBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Mis Reservas</h2>
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">No tienes reservas activas</p>
          <p className="text-sm">Cuando realices una reserva, aparecerá aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Mis Reservas</h2>
      <div className="space-y-4">
        {userBookings.map((booking) => {
          const property = getPropertyDetails(booking.propertyId);
          if (!property) return null;

          return (
            <div key={booking.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(booking.startDate), 'dd/MM/yyyy')} -{' '}
                      {format(new Date(booking.endDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Confirmada' : 
                     booking.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                  </span>
                  <p className="mt-2 font-semibold">{new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(booking.totalPrice)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};