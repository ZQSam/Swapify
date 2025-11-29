import { useState, useEffect, useMemo } from 'react';
import { BookAPI } from '../lib/api';
import type { Book } from '../lib/api';
import { BookCard, LoadingSpinner } from '../components/ui';
import { Search } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function BooksPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  // Load books from API
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await BookAPI.list({
        search: searchQuery || undefined,
        status: 'available',
      });
      setAllBooks(response.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadBooks();
    // Reset filters when searching
    setSelectedTerms(new Set());
    setSelectedCourses(new Set());
    setSelectedBooks(new Set());
  };

  // Extract unique filter options from search results
  const filterOptions = useMemo(() => {
    const terms = new Set<string>();
    const courses = new Set<string>();
    const bookTitles = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    allBooks.forEach(book => {
      if (book.term) terms.add(book.term);
      if (book.courseCode) courses.add(book.courseCode);
      if (book.title) bookTitles.add(book.title);
      if (book.price < minPrice) minPrice = book.price;
      if (book.price > maxPrice) maxPrice = book.price;
    });

    return {
      terms: Array.from(terms).sort(),
      courses: Array.from(courses).sort(),
      bookTitles: Array.from(bookTitles).sort(),
      priceRange: [
        minPrice === Infinity ? 0 : Math.floor(minPrice),
        maxPrice === -Infinity ? 200 : Math.ceil(maxPrice)
      ] as [number, number]
    };
  }, [allBooks]);

  // Update price range when filter options change
  useEffect(() => {
    setPriceRange(filterOptions.priceRange);
  }, [filterOptions.priceRange]);

  // Apply client-side filters
  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      // Price filter
      if (book.price < priceRange[0] || book.price > priceRange[1]) {
        return false;
      }

      // Term filter
      if (selectedTerms.size > 0 && !selectedTerms.has(book.term || '')) {
        return false;
      }

      // Course filter
      if (selectedCourses.size > 0 && !selectedCourses.has(book.courseCode)) {
        return false;
      }

      // Book title filter
      if (selectedBooks.size > 0 && !selectedBooks.has(book.title)) {
        return false;
      }

      return true;
    });
  }, [allBooks, priceRange, selectedTerms, selectedCourses, selectedBooks]);

  const toggleFilter = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setter(newSet);
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
        
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by course code, course name, book title, or ISBN..."
            style={{
              flex: 1,
              height: '48px',
              padding: '0 16px',
              fontSize: '16px',
              border: '1px solid var(--color-gray-100)',
              borderRadius: '8px',
              outline: 'none',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-100)'}
          />
          <button
            onClick={handleSearch}
            style={{
              minWidth: '120px',
              height: '48px',
              padding: '0 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            <Search size={24} />
            Search
          </button>
        </div>

        
        <div style={{ display: 'flex', gap: '24px' }}>
          
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-gray-100)',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: 'calc(100vh - 200px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              
              <div style={{ marginBottom: '32px', flexShrink: 0 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Price</h3>
                <div style={{ padding: '0 8px', marginBottom: '12px' }}>
                  <Slider
                    range
                    min={filterOptions.priceRange[0]}
                    max={filterOptions.priceRange[1]}
                    value={priceRange}
                    onChange={(value) => setPriceRange(value as [number, number])}
                    trackStyle={[{ backgroundColor: 'var(--color-navy)' }]}
                    handleStyle={[
                      { borderColor: 'var(--color-navy)', backgroundColor: 'white' },
                      { borderColor: 'var(--color-navy)', backgroundColor: 'white' }
                    ]}
                    railStyle={{ backgroundColor: 'var(--color-gray-100)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-gray-300)' }}>
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              
              {filterOptions.terms.length > 0 && (
                <div style={{ marginBottom: '32px', flexShrink: 0 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Term</h3>
                  {filterOptions.terms.map(term => (
                    <label key={term} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={selectedTerms.has(term)}
                        onChange={() => toggleFilter(selectedTerms, term, setSelectedTerms)}
                        style={{ marginRight: '8px', cursor: 'pointer', accentColor: 'var(--color-navy)' }}
                      />
                      <span style={{ fontSize: '14px' }}>{term}</span>
                    </label>
                  ))}
                </div>
              )}

              
              {filterOptions.courses.length > 0 && (
                <div style={{ marginBottom: '32px', minHeight: 0 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Course</h3>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                    {filterOptions.courses.map(course => (
                      <label key={course} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={selectedCourses.has(course)}
                          onChange={() => toggleFilter(selectedCourses, course, setSelectedCourses)}
                          style={{ marginRight: '8px', cursor: 'pointer', accentColor: 'var(--color-navy)' }}
                        />
                        <span style={{ fontSize: '14px' }}>{course}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              
              {filterOptions.bookTitles.length > 0 && (
                <div style={{ minHeight: 0 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Book</h3>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                    {filterOptions.bookTitles.map(title => (
                      <label key={title} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={selectedBooks.has(title)}
                          onChange={() => toggleFilter(selectedBooks, title, setSelectedBooks)}
                          style={{ marginRight: '8px', cursor: 'pointer', accentColor: 'var(--color-navy)' }}
                        />
                        <span style={{ fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          
          <div style={{ flex: 1 }}>
            {filteredBooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-gray-300)' }}>
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No books found</p>
                <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <p style={{ marginBottom: '16px', color: 'var(--color-gray-300)', fontSize: '14px' }}>
                  Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                }}>
                  {filteredBooks.map(book => (
                    <div key={book._id} style={{ width: '240px', flexShrink: 0 }}>
                      <BookCard
                        id={book._id}
                        title={book.title}
                        author={book.author}
                        edition={book.edition}
                        year={book.year}
                        courseCode={book.courseCode}
                        price={book.price}
                        condition={book.condition}
                        status={book.status}
                        image={book.image}
                        seller={book.seller}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
