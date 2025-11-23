import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookAPI } from '../lib/api';
import type { Book } from '../lib/api';
import { LoadingSpinner, Badge, RatingStars, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await BookAPI.get(id);
      setBook(response.book);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Navigate to messages or open chat
    navigate('/messages');
  };

  if (loading) {
    return (
      <div style={{
        paddingTop: 'var(--topbar-h)',
        paddingBottom: 'var(--bottombar-h)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{
        paddingTop: 'var(--topbar-h)',
        paddingBottom: 'var(--bottombar-h)',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--color-error)'
      }}>
        Error: {error || 'Book not found'}
      </div>
    );
  }

  const isOwnBook = user?.id === book.seller?._id;
  const statusLabels = {
    available: 'Available',
    pending: 'Pending Sale',
    sold: 'Sold',
  };

  return (
    <div style={{
      paddingTop: 'var(--topbar-h)',
      paddingBottom: 'var(--bottombar-h)',
      minHeight: '100vh',
      background: 'var(--color-gray-50)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--color-gray-700)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          Back to Books
        </button>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: '32px',
        }}>
          {/* Left: Book Image */}
          <div>
            <div style={{
              width: '100%',
              height: '500px',
              background: book.image
                ? `url(${book.image}) center/cover`
                : 'var(--color-gray-50)',
              borderRadius: '12px',
              border: '1px solid var(--color-gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gray-300)',
            }}>
              {!book.image && 'No Image'}
            </div>
          </div>

          {/* Right: Book Details */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '12px',
            padding: '32px',
          }}>
            {/* Status Badge */}
            <div style={{ marginBottom: '16px' }}>
              <Badge variant={book.status}>{statusLabels[book.status]}</Badge>
            </div>

            {/* Course Code */}
            <div style={{
              fontSize: '14px',
              color: 'var(--color-primary)',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              {book.courseCode}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              margin: '0 0 8px 0',
            }}>
              {book.title}
            </h1>

            {/* Author */}
            {book.author && (
              <p style={{
                fontSize: '18px',
                color: 'var(--color-gray-300)',
                margin: '0 0 24px 0',
              }}>
                by {book.author}
              </p>
            )}

            {/* Price */}
            <div style={{
              fontSize: '40px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: '24px',
            }}>
              ${book.price.toFixed(2)}
            </div>

            {/* Book Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--color-gray-100)',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-300)', marginBottom: '4px' }}>
                  Condition
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                  {book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
                </div>
              </div>

              {book.isbn && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-300)', marginBottom: '4px' }}>
                    ISBN
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                    {book.isbn}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                  Description
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-gray-700)', lineHeight: '1.6' }}>
                  {book.description}
                </p>
              </div>
            )}

            {/* Seller Info */}
            <div style={{
              padding: '20px',
              background: 'var(--color-gray-50)',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                Seller Information
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                    {book.seller.nickname}
                  </div>
                  <RatingStars
                    rating={book.seller.averageRating || 0}
                    count={book.seller.ratingCount || 0}
                    size={16}
                  />
                </div>
              </div>
            </div>

            {/* Contact Button */}
            {!isOwnBook && book.status === 'available' && (
              <Button
                variant="primary"
                onClick={handleContactSeller}
                style={{ width: '100%', fontSize: '16px', padding: '16px' }}
              >
                <MessageSquare size={20} />
                Contact Seller
              </Button>
            )}

            {isOwnBook && (
              <div style={{
                padding: '16px',
                background: 'var(--color-gray-50)',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'var(--color-gray-700)',
                fontSize: '14px',
              }}>
                This is your listing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
