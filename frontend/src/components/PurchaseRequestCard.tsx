import { useNavigate } from 'react-router-dom';
import type { Message } from '../lib/api';

interface PurchaseRequestCardProps {
  message: Message;
  isOwn: boolean;
}

export function PurchaseRequestCard({ message, isOwn }: PurchaseRequestCardProps) {
  const navigate = useNavigate();
  const pr = message.purchaseRequest;

  if (!pr) return null;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const statusColors = {
    pending: '#f59e0b',
    accepted: '#10b981',
    rejected: '#ef4444',
    completed: '#6b7280',
  };

  const handleViewBook = () => {
    navigate(`/books/${pr.book._id}`);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: '16px'
    }}>
      <div style={{ maxWidth: '400px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            {message.sender.nickname}
          </span>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          border: isOwn ? '2px solid #FF5F05' : '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Purchase Request Header */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              fontSize: '13px',
              fontWeight: '500',
              color: '#92400e',
              marginBottom: '8px'
            }}>
              📦 Purchase Request
            </div>
            <div style={{
              display: 'inline-block',
              marginLeft: '8px',
              padding: '4px 12px',
              borderRadius: '12px',
              backgroundColor: statusColors[pr.status] + '20',
              fontSize: '12px',
              fontWeight: '500',
              color: statusColors[pr.status],
            }}>
              {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
            </div>
          </div>

          {/* Book Info */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {pr.book.image && (
              <img
                src={pr.book.image}
                alt={pr.book.title}
                style={{
                  width: '80px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  flexShrink: 0
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 4px 0',
                fontSize: '15px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {pr.book.title}
              </h4>
              {pr.book.author && (
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  by {pr.book.author}
                </p>
              )}
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#FF5F05'
              }}>
                ${pr.book.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Optional Text Content */}
          {message.content && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#4b5563',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {message.content}
              </p>
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={handleViewBook}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            View Book Details
          </button>
        </div>

        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '4px',
          textAlign: isOwn ? 'right' : 'left'
        }}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
