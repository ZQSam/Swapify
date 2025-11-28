import type { Conversation } from '../lib/api';

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
}

export function ConversationList({
  conversations,
  selectedUserId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '24px'
      }}>
        <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '14px' }}>
          No conversations yet.
          <br />
          Contact a seller to start chatting!
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {conversations.map((conv) => {
        const isSelected = selectedUserId === conv.user.id;
        const formattedTime = getRelativeTime(new Date(conv.lastMessage.createdAt));

        // Get message preview
        let messagePreview = '';
        if (conv.lastMessage.messageType === 'purchase_request') {
          messagePreview = '📦 Purchase Request';
        } else {
          messagePreview = conv.lastMessage.content || '';
        }

        return (
          <div
            key={conv.user.id}
            onClick={() => onSelectConversation(conv.user.id)}
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              cursor: 'pointer',
              backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
              borderLeft: isSelected ? '4px solid #FF5F05' : 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {conv.user.nickname}
              </h3>
              {conv.unreadCount > 0 && (
                <span style={{
                  display: 'inline-block',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  backgroundColor: '#FF5F05',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              color: conv.lastMessage.read ? '#6b7280' : '#111827',
              fontWeight: conv.lastMessage.read ? '400' : '500',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {messagePreview}
            </p>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              {formattedTime}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
