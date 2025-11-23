import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookAPI } from '../lib/api';
import type { Book } from '../lib/api';
import { LoadingSpinner, Badge, Button } from '../components/ui';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function MyBooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMyBooks();
  }, []);

  const loadMyBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await BookAPI.getMyBooks();
      setBooks(response.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await BookAPI.delete(id);
      setBooks(books.filter(book => book._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const statusLabels = {
    available: 'Available',
    pending: 'Pending Sale',
    sold: 'Sold',
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

  if (error) {
    return (
      <div style={{
        paddingTop: 'var(--topbar-h)',
        paddingBottom: 'var(--bottombar-h)',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--color-error)'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{
      paddingTop: 'var(--topbar-h)',
      paddingBottom: 'var(--bottombar-h)',
      minHeight: '100vh',
      background: 'var(--color-gray-50)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--color-gray-900)',
            margin: 0,
          }}>
            My Listings
          </h1>

          <Button
            variant="primary"
            onClick={() => navigate('/my-books/create')}
          >
            <Plus size={20} />
            Create New Listing
          </Button>
        </div>

        {/* Books List */}
        {books.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '12px',
            padding: '64px 32px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '18px', color: 'var(--color-gray-300)', marginBottom: '24px' }}>
              You haven't created any listings yet
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/my-books/create')}
            >
              <Plus size={20} />
              Create Your First Listing
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {books.map(book => (
              <div
                key={book._id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--color-gray-100)',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  gap: '24px',
                }}
              >
                {/* Book Image */}
                <div
                  onClick={() => navigate(`/books/${book._id}`)}
                  style={{
                    width: '120px',
                    height: '160px',
                    flexShrink: 0,
                    background: book.image
                      ? `url(${book.image}) center/cover`
                      : 'var(--color-gray-50)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gray-300)',
                    fontSize: '12px',
                  }}
                >
                  {!book.image && 'No Image'}
                </div>

                {/* Book Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Badge variant={book.status}>{statusLabels[book.status]}</Badge>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}>
                    {book.courseCode}
                  </div>

                  <h3
                    onClick={() => navigate(`/books/${book._id}`)}
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--color-gray-900)',
                      margin: '0 0 4px 0',
                      cursor: 'pointer',
                    }}
                  >
                    {book.title}
                  </h3>

                  {book.author && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--color-gray-300)',
                      margin: '0 0 12px 0',
                    }}>
                      by {book.author}
                    </p>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto auto',
                    gap: '16px',
                    fontSize: '14px',
                    color: 'var(--color-gray-700)',
                    marginTop: 'auto',
                  }}>
                    <div>
                      <span style={{ color: 'var(--color-gray-300)' }}>Price: </span>
                      <span style={{ fontWeight: 600 }}>${book.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-gray-300)' }}>Condition: </span>
                      <span style={{ fontWeight: 600 }}>
                        {book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
                      </span>
                    </div>
                    {book.term && (
                      <div>
                        <span style={{ color: 'var(--color-gray-300)' }}>Term: </span>
                        <span style={{ fontWeight: 600 }}>{book.term}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  <button
                    onClick={() => navigate(`/my-books/${book._id}/edit`)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(book._id, book.title)}
                    disabled={deletingId === book._id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: deletingId === book._id ? 'var(--color-gray-100)' : 'white',
                      color: deletingId === book._id ? 'var(--color-gray-300)' : 'var(--color-error)',
                      border: `1px solid ${deletingId === book._id ? 'var(--color-gray-100)' : 'var(--color-error)'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: deletingId === book._id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Trash2 size={16} />
                    {deletingId === book._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
