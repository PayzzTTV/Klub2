'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDate?: Date;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Reset time to midnight for comparison
    selectedDate.setHours(0, 0, 0, 0);
    const minDateMidnight = new Date(minDate);
    minDateMidnight.setHours(0, 0, 0, 0);

    // Check if date is before minDate
    if (selectedDate < minDateMidnight) {
      return;
    }

    if (!startDate || isSelectingEnd) {
      // If no start date or we're selecting end date
      if (!startDate) {
        onStartDateChange(selectedDate);
        setIsSelectingEnd(true);
      } else if (selectedDate >= startDate) {
        onEndDateChange(selectedDate);
        setIsSelectingEnd(false);
      } else {
        // If selected date is before start date, reset
        onStartDateChange(selectedDate);
        onEndDateChange(null);
        setIsSelectingEnd(true);
      }
    } else {
      // Start new selection
      onStartDateChange(selectedDate);
      onEndDateChange(null);
      setIsSelectingEnd(true);
    }
  };

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);

    return (
      (startDate && date.getTime() === startDate.getTime()) ||
      (endDate && date.getTime() === endDate.getTime())
    );
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const minDateMidnight = new Date(minDate);
    minDateMidnight.setHours(0, 0, 0, 0);
    return date < minDateMidnight;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Non sélectionné';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const inRange = isDateInRange(day);
      const selected = isDateSelected(day);
      const disabled = isDateDisabled(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={`
            aspect-square flex items-center justify-center text-sm font-medium rounded
            transition-all
            ${disabled ? 'text-[#333] cursor-not-allowed' : 'hover:bg-[#1A1A1A]'}
            ${selected ? 'bg-[#7C3AED] text-white font-bold' : ''}
            ${inRange && !selected ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : ''}
            ${!selected && !inRange && !disabled ? 'text-white' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const clearDates = () => {
    onStartDateChange(null);
    onEndDateChange(null);
    setIsSelectingEnd(false);
  };

  return (
    <div className="brutalist-card p-6">
      {/* Selected Dates Display */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A0A0A0] mb-1">Date de début</p>
            <p className="text-sm font-semibold">{formatDate(startDate)}</p>
          </div>
          <div className="text-2xl">→</div>
          <div className="text-right">
            <p className="text-xs text-[#A0A0A0] mb-1">Date de fin</p>
            <p className="text-sm font-semibold">{formatDate(endDate)}</p>
          </div>
        </div>

        {startDate && endDate && (
          <div className="text-center pt-3 border-t border-[#1A1A1A]">
            <p className="text-sm text-[#A0A0A0]">
              Durée: <span className="text-white font-semibold">
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} jour(s)
              </span>
            </p>
          </div>
        )}

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={clearDates}
            className="w-full text-sm text-[#FF0055] hover:underline"
          >
            Réinitialiser les dates
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={previousMonth}
          className="px-3 py-1 hover:bg-[#1A1A1A] rounded transition-colors"
        >
          ←
        </button>
        <h3 className="text-lg font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="px-3 py-1 hover:bg-[#1A1A1A] rounded transition-colors"
        >
          →
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <div key={day} className="text-center text-xs text-[#A0A0A0] font-semibold">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderDays()}
      </div>

      {/* Helper Text */}
      <div className="mt-4 text-xs text-[#A0A0A0] text-center">
        {!startDate && 'Sélectionnez la date de début'}
        {startDate && !endDate && 'Sélectionnez la date de fin'}
        {startDate && endDate && '✓ Dates sélectionnées'}
      </div>
    </div>
  );
}
