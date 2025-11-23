import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookAPI } from '../lib/api';
import type { Book } from '../lib/api';
import { LoadingSpinner, Button, Input } from '../components/ui';
import { ArrowLeft, Save } from 'lucide-react';

export default function BookFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    courseCode: '',
    courseName: '',
    term: '',
    price: '',
    condition: 'used' as 'new' | 'used',
    description: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadBook(id);
    }
  }, [id, isEdit]);

  const loadBook = async (bookId: string) => {
    try {
      setLoading(true);
      const response = await BookAPI.get(bookId);
      const book = response.book;

      setFormData({
        title: book.title,
        author: book.author || '',
        isbn: book.isbn || '',
        courseCode: book.courseCode,
        courseName: book.courseName || '',
        term: book.term || '',
        price: book.price.toString(),
        condition: book.condition,
        description: book.description || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.courseCode || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const bookData = {
        title: formData.title,
        author: formData.author || undefined,
        isbn: formData.isbn || undefined,
        courseCode: formData.courseCode,
        courseName: formData.courseName || undefined,
        term: formData.term || undefined,
        price,
        condition: formData.condition,
        description: formData.description || undefined,
      };

      if (isEdit && id) {
        await BookAPI.update(id, bookData);
      } else {
        await BookAPI.create(bookData);
      }

      navigate('/my-books');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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

  return (
    <div style={{
      paddingTop: 'var(--topbar-h)',
      paddingBottom: 'var(--bottombar-h)',
      minHeight: '100vh',
      background: 'var(--color-gray-50)',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-books')}
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
          Back to My Listings
        </button>

        {/* Form */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid var(--color-gray-100)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--color-gray-900)',
            margin: '0 0 32px 0',
          }}>
            {isEdit ? 'Edit Listing' : 'Create New Listing'}
          </h1>

          {error && (
            <div style={{
              padding: '16px',
              marginBottom: '24px',
              backgroundColor: '#FEE2E2',
              border: '1px solid var(--color-error)',
              borderRadius: '8px',
              color: 'var(--color-error)',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  Book Title <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter book title"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  placeholder="Enter author name"
                />
              </div>

              {/* ISBN */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  ISBN
                </label>
                <Input
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  placeholder="Enter ISBN"
                />
              </div>

              {/* Course Code and Course Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Course Code <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <Input
                    value={formData.courseCode}
                    onChange={(e) => handleChange('courseCode', e.target.value)}
                    placeholder="e.g., CS 374"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Course Name
                  </label>
                  <Input
                    value={formData.courseName}
                    onChange={(e) => handleChange('courseName', e.target.value)}
                    placeholder="e.g., Algorithms"
                  />
                </div>
              </div>

              {/* Term */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  Term
                </label>
                <Input
                  value={formData.term}
                  onChange={(e) => handleChange('term', e.target.value)}
                  placeholder="e.g., Fall 2025"
                />
              </div>

              {/* Price and Condition */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Price <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Condition <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value as 'new' | 'used')}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '16px',
                      border: '1px solid var(--color-gray-100)',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add any additional details about the book..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '1px solid var(--color-gray-100)',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                style={{ width: '100%', fontSize: '16px', padding: '16px' }}
              >
                <Save size={20} />
                {submitting ? 'Saving...' : (isEdit ? 'Update Listing' : 'Create Listing')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
