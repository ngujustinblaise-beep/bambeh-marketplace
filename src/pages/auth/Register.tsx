// BAMBEH_DEPLOY_TOKEN__REGISTER_FIX763_CLEAN
/**
 * src/pages/auth/Register.tsx - FIX763 (replaces FIX587) - route /register
 *
 * EVERY "SIGN UP" OPENS THE 30-SECOND ACCOUNT. Big, 15 Oct 2026, sent this file so the long form could go.
 * The header's "Sign up", the chatbot, old adverts, QR codes and bookmarks all still say /register: they now
 * open /join (QuickJoin, FIX762) with everything the link carried - ?agent=, ?next=, ?for=, ?with=email -
 * and the way back to the page she came from.
 *
 * What the long form did, and where it is now:
 *   - name, phone number as the login (FIX283), password of 8 or more (FIX284)  -> the same on /join;
 *   - an email address instead                                                  -> "No Cameroon number?
 *     Sign up with an email address" on /join (?with=email opens it that way);
 *   - the agent code (FIX587)                                                    -> "Helped by a Bambeh
 *     agent?" on /join, open by itself when the link carries ?agent=;
 *   - the terms box                                                              -> one box that says
 *     plainly it covers the Terms AND the use of personal data, kept with the account (FIX762/FIX766).
 * Left out on purpose: a second "confirm password" box (the eye shows what she typed), the strength bar,
 * and a contact email next to a phone number (asked later, when it is needed).
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { Navigate, useLocation } from 'react-router-dom';

export default function Register() {
  const location = useLocation();
  return <Navigate to={{ pathname: '/join', search: location.search }} state={location.state} replace />;
}
// BAMBEH_END_TOKEN__REGISTER_FIX763__COMPLETE
