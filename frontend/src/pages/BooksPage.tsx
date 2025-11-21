import { useState, useEffect } from 'react';
import { BookAPI } from '../lib/api';
import type { Book } from '../lib/api';
import { SearchBar, BookCard, LoadingSpinner, Input } from '../components/ui';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await BookAPI.list({
        search: searchQuery || undefined,
        courseCode: courseCode || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        condition: condition || undefined,
        status: 'available',
      });
      setBooks(response.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadBooks();
  };

  const handleReset = () => {
    setSearchQuery('');
    setCourseCode('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    setTimeout(() => loadBooks(), 0);
  };

  return (
    <div
      style={{
        paddingTop: 'var(--topbar-h)',
        paddingBottom: 'var(--bottombar-h)',
        minHeight: '100vh',
        background: 'var(--color-gray-50)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--color-gray-900)',
            marginBottom: '24px',
          }}
        >
          Find a Book
        </h1>

        {/* Search and Filter */}
        <div
          style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '32px',
            border: '1px solid var(--color-gray-100)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <SearchBar
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <Input
              label="Course Code"
              placeholder="e.g. CS 409"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              fullWidth
            />
            <Input
              label="Min Price"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              fullWidth
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              fullWidth
            />
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-gray-900)',
                  marginBottom: '8px',
                }}
              >
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 16px',
                  border: '1px solid var(--color-gray-100)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                }}
              >
                <option value="">All Conditions</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Acceptable">Acceptable</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={handleSearch}
              style={{
                height: '40px',
                padding: '0 32px',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Search
            </button>
            <button
              onClick={handleReset}
              style={{
                height: '40px',
                padding: '0 32px',
                background: 'transparent',
                color: 'var(--color-gray-300)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '64px 0',
            }}
          >
            <LoadingSpinner size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              background: '#FFEBEE',
              color: 'var(--color-error)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 0',
              color: 'var(--color-gray-300)',
            }}
          >
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>
              No books found
            </p>
            <p style={{ fontSize: '14px' }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <div
              style={{
                marginBottom: '16px',
                color: 'var(--color-gray-300)',
                fontSize: '14px',
              }}
            >
              Found {books.length} {books.length === 1 ? 'book' : 'books'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  id={book._id}
                  title={book.title}
                  author={book.author}
                  courseCode={book.courseCode}
                  price={book.price}
                  condition={book.condition}
                  status={book.status}
                  image={book.images[0]}
                  seller={book.seller}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
