// BAMBEH_DEPLOY_TOKEN__ADMIN_INBOX_FIX843_CLEAN
/**
 * src/admin/AdminInbox.tsx - FIX843 (was an untagged page of made-up messages)
 * ROUTES: /admin/inbox and /admin/live-chat (AdminRouteWrapper)
 *
 * This page showed SAMPLE messages ("Bob Johnson", "bob@example.com" ...) generated in the browser - nothing real,
 * nothing answered. It now opens the real Support inbox (FIX838): the messages members send to Bambeh from
 * "Chat with Bambeh" and the businesses' Priority support. The same inbox is in Command Center > Support inbox.
 * English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useNavigate } from 'react-router-dom';
import AdminSupport from '@/features/admin/AdminSupport';

export default function AdminInbox() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50" data-fix="FIX843">
      <AdminSupport onBack={() => navigate('/admin/center')} />
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_INBOX_FIX843__COMPLETE
