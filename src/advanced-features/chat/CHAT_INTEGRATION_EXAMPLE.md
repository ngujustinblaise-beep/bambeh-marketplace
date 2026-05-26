# 💬 BAMBÉ CHAT SYSTEM - INTEGRATION GUIDE

## Quick Integration Example

### 1. Import Chat App
```typescript
import ChatApp from './advanced-features/chat/ChatApp';
```

### 2. Use in Your Component
```typescript
function MyPage() {
  const currentUser = {
    id: 'user_123',
    name: 'John Doe'
  };

  return (
    <div style={{ height: '100vh' }}>
      <ChatApp 
        userId={currentUser.id}
        userName={currentUser.name}
      />
    </div>
  );
}
```

### 3. Start Chat from Product/Order Page
```typescript
import ChatService from './advanced-features/chat/services/ChatService';

function ProductPage() {
  const handleChatWithVendor = async () => {
    // Navigate to chat and start conversation
    const conversation = await ChatService.getOrCreateConversation(
      vendorId,
      orderId, // optional
      productId // optional
    );
    
    // Navigate to chat page with conversation ID
    history.push(`/chat?conversationId=${conversation.id}`);
  };

  return (
    <button onClick={handleChatWithVendor}>
      💬 Chat with Vendor
    </button>
  );
}
```

### 4. Add Chat Button to Header
```typescript
function Header() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connect to chat service
    ChatService.connect(currentUserId);

    // Listen for new messages
    const unsubscribe = ChatService.onMessage((message) => {
      if (message.senderId !== currentUserId) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <header>
      <Link to="/chat">
        💬 Messages
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </Link>
    </header>
  );
}
```

### 5. Backend API Endpoints Required

Your backend needs these endpoints:
```
POST   /chat/conversations          - Create/get conversation
GET    /chat/conversations          - Get all conversations
GET    /chat/conversations/:id      - Get conversation by ID
DELETE /chat/conversations/:id      - Delete conversation
GET    /chat/conversations/:id/messages - Get messages
POST   /chat/messages               - Send message
DELETE /chat/messages/:id           - Delete message
POST   /chat/upload-image           - Upload image
POST   /chat/upload-voice           - Upload voice message
POST   /chat/conversations/:id/mark-read - Mark messages as read
GET    /chat/search                 - Search messages

WebSocket Events:
- connect
- disconnect
- send_message
- new_message
- start_typing
- stop_typing
- user_typing
- user_online
- user_offline
- message_delivered
- message_read
```

## Testing Checklist

- [ ] Chat connects successfully
- [ ] Can send text messages
- [ ] Can send images
- [ ] Can record and send voice messages
- [ ] Typing indicators work
- [ ] Online/offline status updates
- [ ] Messages marked as read
- [ ] Conversations load
- [ ] Search works
- [ ] Delete messages works
- [ ] Delete conversations works
- [ ] French translations work
- [ ] English translations work
- [ ] Mobile responsive
- [ ] Emoji picker works
- [ ] Image compression works
- [ ] Notifications work