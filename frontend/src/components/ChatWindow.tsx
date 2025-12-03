import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import type { Message } from '../lib/api';
import { MessageBubble } from './MessageBubble';
import { PurchaseRequestCard } from './PurchaseRequestCard';

interface ChatWindowProps {
  messages: Message[];
  otherUser: { id: string; nickname: string };
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onRefresh?: () => void;
  onMarkAsRead?: () => void;
  loading: boolean;
}

export function ChatWindow({
  messages,
  otherUser,
  currentUserId,
  onSendMessage,
  onRefresh,
  onMarkAsRead,
  loading,
}: ChatWindowProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      onClick={onMarkAsRead}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%'
      }}>

      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          {otherUser.nickname}
        </h2>
        <button
          onClick={() => navigate(`/users/${otherUser.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
        >
          <User size={16} />
          View Profile
        </button>
      </div>

      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: 0
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <p style={{ color: '#6b7280' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <p style={{ color: '#6b7280', textAlign: 'center' }}>
              No messages yet.
              <br />
              <span style={{ fontSize: '14px' }}>Start the conversation!</span>
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.sender._id === currentUserId;

              if (message.messageType === 'purchase_request') {
                return (
                  <PurchaseRequestCard
                    key={message._id}
                    message={message}
                    isOwn={isOwn}
                    onStatusChange={onRefresh}
                  />
                );
              }

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      
      <div style={{
        padding: '20px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '24px',
              fontSize: '15px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            style={{
              padding: '12px 24px',
              borderRadius: '24px',
              backgroundColor: inputValue.trim() ? '#FF5F05' : '#d1d5db',
              color: '#ffffff',
              fontWeight: '500',
              fontSize: '15px',
              border: 'none',
              cursor: !inputValue.trim() || sending ? 'not-allowed' : 'pointer',
              opacity: !inputValue.trim() || sending ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
