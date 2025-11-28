import type { Message } from '../lib/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isOwn) {
    // Own messages - right aligned with orange border
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ maxWidth: '70%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              You
            </span>
          </div>
          <div style={{
            padding: '12px 16px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '2px solid #FF5F05',
          }}>
            <p style={{
              color: '#1f2937',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0
            }}>
              {message.content}
            </p>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
            {formattedTime}
          </div>
        </div>
      </div>
    );
  }

  // Other's messages - left aligned with gray background
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
      <div style={{ maxWidth: '70%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            {message.sender.nickname}
          </span>
        </div>
        <div style={{
          padding: '12px 16px',
          borderRadius: '16px',
          backgroundColor: '#f3f4f6',
        }}>
          <p style={{
            color: '#1f2937',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0
          }}>
            {message.content}
          </p>
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
