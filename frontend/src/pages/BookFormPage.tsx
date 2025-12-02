import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookAPI, BookTemplateAPI, CourseAPI } from '../lib/api';
import type { BookTemplateSuggestion, Course } from '../lib/api';
import { LoadingSpinner, Button, Input, Select } from '../components/ui';
import { ArrowLeft, Save, Search } from 'lucide-react';

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
    edition: '',
    year: '',
    courseCode: '',
    courseName: '',
    term: '',
    price: '',
    condition: 'used' as 'new' | 'used',
    description: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Book template search states
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateSuggestions, setTemplateSuggestions] = useState<BookTemplateSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingTemplates, setSearchingTemplates] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Course selection states
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Available terms from backend
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadBook(id);
    }
  }, [id, isEdit]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load available terms on mount
  useEffect(() => {
    loadAvailableTerms();
  }, []);

  // Load courses when term changes
  useEffect(() => {
    if (formData.term) {
      loadCoursesByTerm(formData.term);
    } else {
      setCourses([]);
    }
  }, [formData.term]);

  const loadAvailableTerms = async () => {
    try {
      setLoadingTerms(true);
      const response = await BookTemplateAPI.getAvailableTerms();
      setAvailableTerms(response.terms);
    } catch (err) {
      console.error('Failed to load terms:', err);
      setAvailableTerms([]);
    } finally {
      setLoadingTerms(false);
    }
  };

  const loadCoursesByTerm = async (term: string) => {
    try {
      setLoadingCourses(true);
      const response = await CourseAPI.getByTerm(term);
      setCourses(response.courses);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadBook = async (bookId: string) => {
    try {
      setLoading(true);
      const response = await BookAPI.get(bookId);
      const book = response.book;

      setFormData({
        title: book.title,
        author: book.author || '',
        isbn: book.isbn || '',
        edition: book.edition || '',
        year: book.year ? book.year.toString() : '',
        courseCode: book.courseCode,
        courseName: book.courseName || '',
        term: book.term || '',
        price: book.price.toString(),
        condition: book.condition as 'new' | 'used',
        description: book.description || '',
        image: book.image || '',
      });

      if (book.image) {
        setImagePreview(book.image);
      }
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
        edition: formData.edition || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        courseCode: formData.courseCode,
        courseName: formData.courseName || undefined,
        term: formData.term || undefined,
        price,
        condition: formData.condition,
        description: formData.description || undefined,
        image: formData.image || undefined,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData({ ...formData, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };


  const handleTemplateSearch = (value: string) => {
    setTemplateSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setTemplateSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingTemplates(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await BookTemplateAPI.search(value.trim(), 5);
        setTemplateSuggestions(response.suggestions);
        setShowSuggestions(response.suggestions.length > 0);
      } catch (err) {
        console.error('Failed to search templates:', err);
        setTemplateSuggestions([]);
      } finally {
        setSearchingTemplates(false);
      }
    }, 300);
  };

  const handleSelectTemplate = (suggestion: BookTemplateSuggestion) => {
    // Auto-fill form fields including ISBN and image
    setFormData({
      ...formData,
      title: suggestion.title,
      author: suggestion.author || '',
      isbn: suggestion.isbn || '',
      edition: suggestion.edition || '',
      year: suggestion.year ? suggestion.year.toString() : '',
      courseCode: suggestion.courseInfo?.code || '',
      courseName: suggestion.courseInfo?.name || '',
      term: suggestion.courseInfo?.term || '',
      image: suggestion.coverImage || '',
    });

    // Set image preview if available
    if (suggestion.coverImage) {
      setImagePreview(suggestion.coverImage);
    }

    // Clear search
    setTemplateSearch('');
    setShowSuggestions(false);
    setTemplateSuggestions([]);
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
              
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-gray-900)',
                  marginBottom: '8px',
                }}>
                  Book Info
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-gray-700)',
                  marginBottom: '12px',
                }}>
                  Populate the book info by searching for the book
                </p>

                <div ref={suggestionsRef} style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => handleTemplateSearch(e.target.value)}
                      placeholder="Search by Course Code, Book Name or Course Name"
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 48px 0 16px',
                        fontSize: '16px',
                        border: '1px solid var(--color-gray-100)',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={() => {
                        if (templateSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                    />
                    <Search
                      size={20}
                      color="var(--color-gray-300)"
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  
                  {showSuggestions && templateSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'white',
                      border: '1px solid var(--color-gray-100)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      zIndex: 100,
                    }}>
                      {templateSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          onClick={() => handleSelectTemplate(suggestion)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--color-gray-100)',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-gray-50)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--color-gray-900)',
                            marginBottom: '4px',
                          }}>
                            {suggestion.title}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: 'var(--color-gray-700)',
                          }}>
                            by {suggestion.author}
                            {suggestion.edition && `, ${suggestion.edition} Edition`}
                            {suggestion.year && ` (${suggestion.year})`}
                          </div>
                          {suggestion.courseInfo && (
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--color-primary)',
                              marginTop: '4px',
                            }}>
                              {suggestion.courseInfo.code} - {suggestion.courseInfo.term}
                              {suggestion.courseInfo.section && `, ${suggestion.courseInfo.section}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {searchingTemplates && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'white',
                      border: '1px solid var(--color-gray-100)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      color: 'var(--color-gray-300)',
                      fontSize: '14px',
                    }}>
                      Searching...
                    </div>
                  )}
                </div>
              </div>

              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                margin: '8px 0',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-100)' }} />
                <span style={{ fontSize: '14px', color: 'var(--color-gray-300)', fontWeight: 500 }}>
                  OR Enter the info manually
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-100)' }} />
              </div>

              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-gray-700)',
                  marginBottom: '8px',
                }}>
                  Book Cover
                </label>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}>
                  
                  <div style={{
                    width: '200px',
                    height: '280px',
                    border: '2px dashed var(--color-gray-100)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: imagePreview ? `url(${imagePreview}) center/cover` : 'var(--color-gray-50)',
                    position: 'relative',
                  }}>
                    {!imagePreview && (
                      <span style={{ color: 'var(--color-gray-300)', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
                        No cover image
                      </span>
                    )}
                  </div>

                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{
                      padding: '12px 24px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}>
                      {imagePreview ? 'Replace Image' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: 'white',
                          color: 'var(--color-error)',
                          border: '1px solid var(--color-error)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Remove Image
                      </button>
                    )}

                    <p style={{ fontSize: '12px', color: 'var(--color-gray-300)', margin: 0 }}>
                      Max size: 5MB<br />
                      Formats: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>

              
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

              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Edition
                  </label>
                  <Input
                    value={formData.edition}
                    onChange={(e) => handleChange('edition', e.target.value)}
                    placeholder="e.g., 3rd"
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
                    Year
                  </label>
                  <Input
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Term <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <Select
                    value={formData.term}
                    onChange={(e) => {
                      handleChange('term', e.target.value);
                      // Reset course selection when term changes
                      setFormData(prev => ({ ...prev, courseCode: '', courseName: '' }));
                    }}
                    disabled={loadingTerms}
                    style={{
                      backgroundColor: loadingTerms ? 'var(--color-gray-50)' : 'white',
                    }}
                    required
                  >
                    <option value="">
                      {loadingTerms ? 'Loading terms...' : 'Select a term'}
                    </option>
                    {availableTerms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-700)',
                    marginBottom: '8px',
                  }}>
                    Course <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <Select
                    value={formData.courseCode}
                    onChange={(e) => {
                      const selectedCourse = courses.find(c => c.code === e.target.value);
                      if (selectedCourse) {
                        setFormData(prev => ({
                          ...prev,
                          courseCode: selectedCourse.code,
                          courseName: selectedCourse.name
                        }));
                      }
                    }}
                    disabled={!formData.term || loadingCourses}
                    style={{
                      backgroundColor: !formData.term || loadingCourses ? 'var(--color-gray-50)' : 'white',
                    }}
                    required
                  >
                    <option value="">
                      {loadingCourses ? 'Loading courses...' : formData.term ? 'Select a course' : 'Select term first'}
                    </option>
                    {courses.map(course => (
                      <option key={course.code} value={course.code}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              
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
                  <Select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value as 'new' | 'used')}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </Select>
                </div>
              </div>

              
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
