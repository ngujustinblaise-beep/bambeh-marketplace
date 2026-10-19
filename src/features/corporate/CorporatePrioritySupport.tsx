// BAMBEH_DEPLOY_TOKEN__CORPORATEPRIORITYSUPPORT_FIX841_CLEAN
/**
 * CorporatePrioritySupport.tsx - FIX841 (was FIX154)
 * FILE LOCATION: src/features/corporate/CorporatePrioritySupport.tsx
 * ROUTE: /corporate/support (AuthGate require="user") - the dashboard's "Priority support"
 *
 * FIX154 wrote support tickets straight into the table, and nobody at Bambeh ever read them: there was no screen.
 * It is now "Chat with Bambeh" (FIX837) for the business: its messages go to Command Center > Support inbox
 * (FIX838) at the top of the list, Bambeh answers there, the business is told in its language.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import SupportChat from '@/features/support/SupportChat';

export default function CorporatePrioritySupport() {
  return <SupportChat business />;
}
// BAMBEH_END_TOKEN__CORPORATEPRIORITYSUPPORT_FIX841__COMPLETE
