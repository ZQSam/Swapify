import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Badge from './Badge';
import RatingStars from './RatingStars';

export interface BookCardProps {
  id: string;
  image?: string;
  title: string;
  author?: string;
  courseCode: string;
  price: number;
  condition: string;
  status: 'available' | 'pending' | 'sold';
  seller: {
    nickname: string;
    averageRating: number;
    ratingCount: number;
  };
}

export default function BookCard({
  id,
  image,
  title,
  author,
  courseCode,
  price,
  condition,
  status,
  seller,
}: BookCardProps) {
  const navigate = useNavigate();

  const statusLabels = {
    available: 'Available',
    pending: 'Pending Sale',
    sold: 'Sold',
  };

  return (
    <Card hover onClick={() => navigate(`/books/${id}`)}>
      <div style={{ padding: '16px' }}>
        {/* Book Image */}
        <div
          style={{
            width: '100%',
            height: '200px',
            background: image
              ? `url(${image}) center/cover`
              : 'var(--color-gray-50)',
            borderRadius: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-gray-300)',
          }}
        >
          {!image && 'No Image'}
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '8px' }}>
          <Badge variant={status}>{statusLabels[status]}</Badge>
        </div>

        {/* Course Code */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-primary)',
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          {courseCode}
        </div>

        {/* Book Title */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-gray-900)',
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h3>

        {/* Author */}
        {author && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-gray-300)',
              margin: '0 0 8px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {author}
          </p>
        )}

        {/* Condition */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-gray-300)',
            margin: '0 0 12px 0',
          }}
        >
          Condition: {condition}
        </p>

        {/* Price */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '12px',
          }}
        >
          ${price.toFixed(2)}
        </div>

        {/* Seller Info */}
        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--color-gray-100)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-gray-300)',
              marginBottom: '4px',
            }}
          >
            Seller: {seller.nickname}
          </div>
          <RatingStars
            rating={seller.averageRating}
            count={seller.ratingCount}
            size={14}
            showCount={false}
          />
        </div>
      </div>
    </Card>
  );
}
