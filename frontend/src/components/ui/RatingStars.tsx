import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export default function RatingStars({
  rating,
  count,
  size = 16,
  showCount = true,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            fill="var(--color-warning)"
            color="var(--color-warning)"
          />
        ))}
        {hasHalfStar && (
          <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
            <Star size={size} color="var(--color-warning)" />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                overflow: 'hidden',
              }}
            >
              <Star
                size={size}
                fill="var(--color-warning)"
                color="var(--color-warning)"
              />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} color="var(--color-warning)" />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span
          style={{
            fontSize: '14px',
            color: 'var(--color-gray-300)',
          }}
        >
          {rating.toFixed(1)} ({count} {count === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
