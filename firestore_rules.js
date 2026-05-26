rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // USERS COLLECTION
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Admin only
    }
    
    // JOBS COLLECTION
    match /jobs/{jobId} {
      allow read: if true; // Public
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.postedBy == request.auth.uid;
    }
    
    // MARKETPLACE COLLECTION
    match /marketplace/{itemId} {
      allow read: if true; // Public
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.sellerId == request.auth.uid;
    }
    
    // SERVICES COLLECTION
    match /services/{serviceId} {
      allow read: if true; // Public
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.providerId == request.auth.uid;
    }
    
    // RENTALS COLLECTION
    match /rentals/{rentalId} {
      allow read: if true; // Public
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.ownerId == request.auth.uid;
    }
    
    // CHATS COLLECTION
    match /chats/{chatId} {
      allow read: if isAuthenticated() && 
                    request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
                      request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if isAuthenticated() && 
                        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow update, delete: if isAuthenticated() && 
                                resource.data.senderId == request.auth.uid;
      }
    }
    
    // NOTIFICATIONS COLLECTION
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
      allow create: if false; // Cloud Functions only
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
    }
    
    // TRANSACTIONS COLLECTION
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
      allow create, update, delete: if false; // Cloud Functions only
    }
    
    // SUBSCRIPTIONS COLLECTION
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
      allow create, update, delete: if false; // Cloud Functions only
    }
    
    // FAVORITES COLLECTION
    match /favorites/{favoriteId} {
      allow read, write: if isAuthenticated() && 
                           resource.data.userId == request.auth.uid;
    }
    
    // REVIEWS COLLECTION
    match /reviews/{reviewId} {
      allow read: if true; // Public
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.reviewerId == request.auth.uid;
    }
    
    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}