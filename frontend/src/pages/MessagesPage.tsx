import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageAPI } from '../lib/api';
import type { Conversation, Message } from '../lib/api';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useAuth } from '../contexts/AuthContext';

export function MessagesPage() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await MessageAPI.getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load messages with a specific user
  const loadMessages = async (userId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const data = await MessageAPI.getMessagesWith(userId);
      // Only update if messages have changed (prevent flickering)
      setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
          return data.messages;
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (!silent) alert('Failed to load messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Send a message
  const handleSendMessage = async (content: string) => {
    if (!selectedUserId) return;

    try {
      const data = await MessageAPI.send(selectedUserId, content);
      setMessages((prev) => [...prev, data.message]);
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Mark unread messages as read
  const handleMarkAsRead = async () => {
    if (!selectedUserId) return;

    try {
      // Find all unread messages from the other user
      const unreadMessages = messages.filter(
        (msg) => !msg.read && msg.sender._id !== user?.id
      );

      // Mark each unread message as read
      for (const message of unreadMessages) {
        await MessageAPI.markAsRead(message._id);
      }

      // If there were unread messages, refresh both conversations and messages
      if (unreadMessages.length > 0) {
        loadMessages(selectedUserId, true);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Select a conversation
  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    navigate(`/messages/${userId}`);
    loadMessages(userId);
    // Immediately refresh conversations to update unread counts
    loadConversations();
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when URL has userId parameter
  useEffect(() => {
    if (userId && !loadingConversations) {
      setSelectedUserId(userId);
      loadMessages(userId);
      // Immediately refresh conversations to update unread counts
      loadConversations();
    }
  }, [userId, loadingConversations]);

  // Polling for new messages (right side)
  useEffect(() => {
    if (!selectedUserId) return;

    const interval = setInterval(() => {
      loadMessages(selectedUserId, true); // Silent polling
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedUserId]);

  // Polling for new conversations (left side)
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <p style={{ color: '#6b7280' }}>Please log in to view messages.</p>
      </div>
    );
  }

  // Get selected user from conversations, or create a temporary one for new conversations
  const selectedUser = selectedUserId
    ? conversations.find((c) => c.user.id === selectedUserId)?.user || {
        id: selectedUserId,
        nickname: 'New Conversation',
        email: ''
      }
    : null;

  return (
    <div style={{
      paddingTop: 'var(--topbar-h)',
      paddingBottom: 'var(--bottombar-h)',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        height: 'calc(100vh - var(--topbar-h) - var(--bottombar-h))'
      }}>
        
        <div style={{
          width: '320px',
          borderRight: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px 16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              Messages
            </h1>
          </div>
          {loadingConversations ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              <p style={{ color: '#6b7280' }}>Loading...</p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedUserId={selectedUserId}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>

        
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedUserId && selectedUser ? (
            <ChatWindow
              messages={messages}
              otherUser={selectedUser}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              onRefresh={() => loadMessages(selectedUserId)}
              onMarkAsRead={handleMarkAsRead}
              loading={loadingMessages}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              backgroundColor: '#f9fafb'
            }}>
              <p style={{
                color: '#6b7280',
                textAlign: 'center',
                fontSize: '15px'
              }}>
                Select a conversation to start messaging
                <br />
                <span style={{ fontSize: '14px' }}>
                  or contact a seller from a book listing
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
