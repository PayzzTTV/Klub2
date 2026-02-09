'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CalendarProps {
  bookedDates: Array<{
    start_date: string;
    end_date: string;
    status: string;
  }>;
  selectedRange?: {
    start: string | null;
    end: string | null;
  };
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
}

export default function Calendar({ bookedDates, selectedRange, onDateSelect, minDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    return { daysInMonth, firstDayOfMonth, year, month };
  };

  // Check if a date is booked
  const isDateBooked = (date: Date): { booked: boolean; status?: string } => {
    const dateStr = date.toISOString().split('T')[0];

    for (const booking of bookedDates) {
      if (booking.status === 'cancelled') continue;

      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      if (date >= start && date <= end) {
        return { booked: true, status: booking.status };
      }
    }

    return { booked: false };
  };

  // Check if date is in selected range
  const isDateInSelectedRange = (date: Date): boolean => {
    if (!selectedRange?.start || !selectedRange?.end) return false;

    const start = new Date(selectedRange.start);
    const end = new Date(selectedRange.end);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date >= start && date <= end;
  };

  // Check if date is disabled (in the past or before minDate)
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) return true;
    if (minDate && date < minDate) return true;

    return false;
  };

  const { daysInMonth, firstDayOfMonth, year, month } = getDaysInMonth(currentMonth);

  const days = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const { booked, status } = isDateBooked(date);
    const isSelected = isDateInSelectedRange(date);
    const isDisabled = isDateDisabled(date);
    const isToday = new Date().toDateString() === date.toDateString();

    let bgColor = 'bg-[#0A0A0A]';
    let textColor = 'text-white';
    let border = 'border-[#1A1A1A]';
    let cursor = 'cursor-pointer hover:border-[#7C3AED]';

    if (isDisabled) {
      bgColor = 'bg-[#000000]';
      textColor = 'text-[#333333]';
      cursor = 'cursor-not-allowed';
    } else if (booked) {
      if (status === 'pending') {
        bgColor = 'bg-orange-900/20';
        border = 'border-orange-700';
        textColor = 'text-orange-300';
      } else {
        bgColor = 'bg-red-900/20';
        border = 'border-red-700';
        textColor = 'text-red-300';
      }
      cursor = 'cursor-not-allowed';
    } else if (isSelected) {
      bgColor = 'bg-[#7C3AED]/20';
      border = 'border-[#7C3AED]';
      textColor = 'text-[#7C3AED]';
    }

    if (isToday && !booked && !isDisabled) {
      border = 'border-[#00FF66]';
    }

    days.push(
      <motion.button
        key={day}
        type="button"
        onClick={() => !isDisabled && !booked && onDateSelect?.(date)}
        disabled={isDisabled || booked}
        whileHover={!isDisabled && !booked ? { scale: 1.05 } : {}}
        whileTap={!isDisabled && !booked ? { scale: 0.95 } : {}}
        className={`aspect-square border ${border} ${bgColor} ${textColor} ${cursor} rounded-sm flex items-center justify-center text-sm font-semibold transition-all relative`}
      >
        {day}
        {isToday && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#00FF66] rounded-full"></div>
        )}
      </motion.button>
    );
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="brutalist-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#7C3AED] transition-colors rounded-sm"
        >
          ←
        </button>
        <h3 className="text-lg font-bold">
          {monthNames[month]} {year}
        </h3>
        <button
          type="button"
          onClick={handleNextMonth}
          className="px-3 py-1 bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#7C3AED] transition-colors rounded-sm"
        >
          →
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-[#A0A0A0]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#00FF66] border border-[#00FF66] rounded-sm"></div>
          <span className="text-[#A0A0A0]">Aujourd&apos;hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#7C3AED]/20 border border-[#7C3AED] rounded-sm"></div>
          <span className="text-[#A0A0A0]">Sélection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-900/20 border border-red-700 rounded-sm"></div>
          <span className="text-[#A0A0A0]">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-900/20 border border-orange-700 rounded-sm"></div>
          <span className="text-[#A0A0A0]">En attente</span>
        </div>
      </div>
    </div>
  );
}
