importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyAjSrjbb4JXwPfzU6Kx6FH3TibT_u4WDgE",
  authDomain:        "bambeh-marketplace.firebaseapp.com",
  projectId:         "bambeh-marketplace",
  storageBucket:     "bambeh-marketplace.firebasestorage.app",
  messagingSenderId: "943969259540",
  appId:             "1:943969259540:web:f7c56b9e6d3463eac75701"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message received: ', payload);
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, { body, icon: icon || '/bambeh-logo.png' });
});
