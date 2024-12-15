import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addMonths, differenceInMonths, startOfMonth } from 'date-fns';
import { Property } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';

interface BookingCalendarProps {
  property: Property;
  onBookingComplete: () => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  property,
  onBookingComplete,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [months, setMonths] = useState(1);
  const { user } = useAuthStore();
  const { addBooking } = useBookingStore();

  const handleBooking = async () => {
    if (!startDate || !user) return;

    const endDate = addMonths(startDate, months);
    const totalPrice = property.price * months;

    const newBooking = {
      id: Math.random().toString(),
      propertyId: property.id,
      tenantId: user.id,
      startDate: startOfMonth(startDate),
      endDate: startOfMonth(endDate),
      status: 'pending' as const,
      totalPrice,
      paymentStatus: 'pending' as const,
      createdAt: new Date(),
    };

    addBooking(newBooking);
    onBookingComplete();
  };

  const excludeDates = property.unavailableDates || [];
  const minDate = startOfMonth(new Date());
  const maxDate = addMonths(new Date(), 24); // Máximo 2 años

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Inicio (Mes)
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          minDate={minDate}
          maxDate={maxDate}
          excludeDates={excludeDates}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholderText="Selecciona mes de inicio"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duración del Alquiler
        </label>
        <select
          value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {[...Array(24)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i + 1 === 1 ? 'mes' : 'meses'}
            </option>
          ))}
        </select>
      </div>

      {startDate && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Resumen de la Reserva</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Precio mensual:</span>
              <span>${property.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Duración:</span>
              <span>{months} {months === 1 ? 'mes' : 'meses'}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total:</span>
              <span>${property.price * months}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={!startDate}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirmar Reserva
      </button>
    </div>
  );
};