// BAMBEH_DEPLOY_TOKEN__FORGOTCREDENTIALS_FIX478_CLEAN
// FIX478: This ROUTED page was a second fake. Like ForgotPassword it imported
// nothing, waited 900ms with setTimeout, and printed "Recovery instructions
// have been sent" without sending anything. Two separate screens telling the
// same lie to locked-out users.
//
// There is no reason for two. /forgot-credentials now serves the one real
// implementation, which already offers BOTH phone and email in all five
// languages. Same pattern as ExchangeItemDetails (FIX80).
export { default } from './ForgotPassword';
// BAMBEH_END_TOKEN__FORGOTCREDENTIALS_FIX478__COMPLETE
