import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserAPI, RatingAPI } from '../lib/api';
import type { UserProfile, Rating } from '../lib/api';
import { LoadingSpinner, RatingStars, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, LogOut, Star } from 'lucide-react';

function RatingForm({
  userId,
  existingRating,
  onSubmit,
  isSubmitting
}: {
  userId: string;
  existingRating: { score: number; comment?: string } | null;
  onSubmit: (score: number, comment: string) => void;
  isSubmitting: boolean;
}) {
  const [score, setScore] = useState(existingRating?.score || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [hoveredStar, setHoveredStar] = useState(0);

  const hasExistingRating = !!existingRating;

  return (
    <div style={{
      padding: '20px',
      background: 'var(--color-gray-50)',
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--color-gray-900)',
        marginBottom: '12px',
      }}>
        {hasExistingRating ? 'Update Your Rating' : 'Rate This User'}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--color-gray-700)',
          marginBottom: '8px',
        }}>
          Rating
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32}
              style={{ cursor: 'pointer' }}
              fill={(hoveredStar || score) >= star ? '#FF5F05' : 'none'}
              color={(hoveredStar || score) >= star ? '#FF5F05' : 'var(--color-gray-300)'}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setScore(star)}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--color-gray-700)',
          marginBottom: '8px',
        }}>
          Review (optional)
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review..."
          rows={4}
          maxLength={500}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '8px',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <div style={{
          fontSize: '12px',
          color: 'var(--color-gray-300)',
          marginTop: '4px',
        }}>
          {comment.length}/500 characters
        </div>
      </div>

      <Button
        variant="primary"
        onClick={() => onSubmit(score, comment)}
        disabled={score === 0 || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : (hasExistingRating ? 'Update Rating' : 'Submit Rating')}
      </Button>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [existingRating, setExistingRating] = useState<{ score: number; comment?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (id) {
      loadProfile();
      loadRatings();
      if (!isOwnProfile && user) {
        loadExistingRating();
      }
    }
  }, [id, isOwnProfile, user]);

  const loadProfile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await UserAPI.getProfile(id);
      setProfile(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    if (!id) return;

    try {
      const response = await UserAPI.getRatings(id);
      setRatings(response.ratings);
    } catch (err) {
      console.error('Failed to load ratings:', err);
    }
  };

  const loadExistingRating = async () => {
    if (!id) return;

    try {
      const response = await UserAPI.getExistingRating(id);
      setExistingRating(response.existingRating);
    } catch (err) {
      console.error('Failed to load existing rating:', err);
    }
  };

  const handleSubmitRating = async (score: number, comment: string) => {
    if (!id) return;

    try {
      setSubmittingRating(true);
      await RatingAPI.create(id, score, comment || undefined);
      await loadRatings();
      await loadExistingRating();
      alert('Rating submitted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  if (error || !profile) {
    return (
      <div style={{
        paddingTop: 'var(--topbar-h)',
        paddingBottom: 'var(--bottombar-h)',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--color-error)'
      }}>
        Error: {error || 'User not found'}
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
          Back
        </button>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid var(--color-gray-100)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              margin: '0 0 8px 0',
            }}>
              {profile.nickname}
            </h1>
            {isOwnProfile && (
              <p style={{
                fontSize: '16px',
                color: 'var(--color-gray-300)',
                margin: '0 0 8px 0',
              }}>
                {profile.email}
              </p>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}>
              {profile.uiucVerified && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 12px',
                  backgroundColor: '#E8F5E9',
                  color: '#2E7D32',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '12px',
                }}>
                  ✓ Illinois Email Verified
                </span>
              )}
            </div>
            <RatingStars
              rating={profile.averageRating || 0}
              count={profile.ratingCount || 0}
              size={20}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px',
            paddingTop: '24px',
            borderTop: '1px solid var(--color-gray-100)',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-300)', marginBottom: '4px' }}>
                Member Since
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-300)', marginBottom: '4px' }}>
                Total Ratings
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                {profile.ratingCount || 0}
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <Button
              variant="secondary"
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              <LogOut size={20} />
              Logout
            </Button>
          )}
        </div>

        {!isOwnProfile && id && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              margin: '0 0 16px 0',
            }}>
              {existingRating ? 'Your Rating' : 'Rate This User'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-gray-700)',
              marginBottom: '24px',
            }}>
              {existingRating
                ? `You can update your rating for ${profile?.nickname}`
                : `Share your experience with ${profile?.nickname}`}
            </p>
            <RatingForm
              userId={id}
              existingRating={existingRating}
              onSubmit={handleSubmitRating}
              isSubmitting={submittingRating}
            />
          </div>
        )}

        {ratings.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-gray-900)',
              margin: '0 0 24px 0',
            }}>
              Ratings
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ratings.map(rating => (
                <div
                  key={rating._id}
                  style={{
                    padding: '16px',
                    background: 'var(--color-gray-50)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= rating.score ? '#FF5F05' : 'none'}
                          color={star <= rating.score ? '#FF5F05' : 'var(--color-gray-300)'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--color-gray-700)' }}>
                      by {rating.rater.nickname}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-gray-300)', marginLeft: 'auto' }}>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.comment && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--color-gray-700)',
                      margin: 0,
                      lineHeight: '1.5',
                    }}>
                      {rating.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
