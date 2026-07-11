// BAMBEH_DEPLOY_TOKEN__PUSHINIT_FIX87_CLEAN
// FILE LOCATION: src/components/PushInit.tsx
//
// Renders nothing. When a user is signed in, it registers this device for
// push notifications and saves the token (via initPush). Tapping a
// notification opens the chat screen. Drop <PushInit /> once inside
// MainLayout so it lives inside the Router + Auth providers.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { initPush } from '@/utils/pushNotifications';

export default function PushInit() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      initPush(() => navigate('/chat'));
    }
  }, [currentUser, navigate]);

  return null;
}
// BAMBEH_END_TOKEN__PUSHINIT_FIX87__COMPLETE
