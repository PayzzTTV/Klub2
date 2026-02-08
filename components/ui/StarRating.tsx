'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, label, readonly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`text-3xl transition-all ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            {star <= displayValue ? (
              <span className="text-[#7C3AED]">★</span>
            ) : (
              <span className="text-[#2A2A2A]">☆</span>
            )}
          </button>
        ))}
        <span className="ml-2 text-sm font-bold text-[#7C3AED]">
          {displayValue > 0 ? `${displayValue}/5` : ''}
        </span>
      </div>
    </div>
  );
}
