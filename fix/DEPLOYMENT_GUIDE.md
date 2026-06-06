# 🔧 BAMBEH PAYMENT FIX — COMPLETE DEPLOYMENT GUIDE
# ==============================================================
# This guide fixes the CamPay payment system end-to-end.
# Follow every step in order. Do not skip any.
# Time estimate: 20–30 minutes.
# ==============================================================

## ROOT CAUSE SUMMARY
# ────────────────────────────────────────────────────────────────
# 1. Render free tier spins down after 15 min inactivity
#    → First payment request times out → CamPay never initiates
#    → Users see "failed to fetch" or "server starting up"
#
# 2. ZermPurchase.tsx was inserting a 'pending' Supabase record
#    but NEVER calling CamPay at all — no payment prompt sent
#
# 3. Multiple disconnected payment systems (Render server,
#    Edge Functions, direct Supabase) with no single source of truth
#
# THE FIX:
#    Remove the Render server entirely from the payment path.
#    All payments now go: Frontend → Supabase Edge Function → CamPay
#    Supabase Edge Functions are always warm — no cold start.
# ────────────────────────────────────────────────────────────────


## STEP 1 — COPY FILES TO YOUR PROJECT
# ════════════════════════════════════

# In PowerShell, from your project root C:\Dev\bambe-android:

# Create payment component directory
New-Item -ItemType Directory -Force -Path "src\components\payment"

# Copy the hook (single source of truth for all payments)
Copy-Item "path\to\fix\frontend\useCamPay.ts" "src\hooks\useCamPay.ts"

# Copy the reusable widget
Copy-Item "path\to\fix\frontend\CamPayWidget.tsx" "src\components\payment\CamPayWidget.tsx"

# Replace subscription plans page
Copy-Item "path\to\fix\frontend\SubscriptionPlans.tsx" "src\pages\SubscriptionPlans.tsx"

# Replace zerm purchase page
Copy-Item "path\to\fix\frontend\ZermPurchase.tsx" "src\pages\ZermPurchase.tsx"

# Copy unified checkout page
Copy-Item "path\to\fix\frontend\PaymentCheckout.tsx" "src\pages\payment\PaymentCheckout.tsx"


## STEP 2 — SET UP SUPABASE EDGE FUNCTIONS
# ═════════════════════════════════════════

# 2A. Install Supabase CLI if you don't have it:
npm install -g supabase

# 2B. Login to Supabase:
supabase login

# 2C. Link your project (get Project Ref from Supabase Dashboard → Settings → General):
supabase link --project-ref YOUR_PROJECT_REF

# 2D. Create the Edge Function directories:
mkdir -p supabase\functions\campay-collect
mkdir -p supabase\functions\campay-status

# 2E. Copy the function files:
Copy-Item "path\to\fix\supabase-edge-functions\campay-collect\index.ts" "supabase\functions\campay-collect\index.ts"
Copy-Item "path\to\fix\supabase-edge-functions\campay-status\index.ts" "supabase\functions\campay-status\index.ts"

# 2F. Deploy both functions:
supabase functions deploy campay-collect --no-verify-jwt
supabase functions deploy campay-status --no-verify-jwt

# ✅ Verify deployment — you should see "Deployed" for both functions


## STEP 3 — ADD CAMPAY SECRETS TO SUPABASE
# ══════════════════════════════════════════
# Go to: https://supabase.com → Your Project → Edge Functions → Secrets
# Click "Add new secret" for EACH of these:
#
#   Name: CAMPAY_USERNAME
#   Value: (your CamPay username from campay.net/en/developer → App Keys)
#
#   Name: CAMPAY_PASSWORD  
#   Value: (your CamPay password from campay.net/en/developer → App Keys)
#
# ⚠️  IMPORTANT: These are your CamPay APP credentials, NOT your campay.net login.
#     Go to campay.net/en/developer → click your app → look for "App Keys" section.
#
# After adding secrets, redeploy the functions:
supabase functions deploy campay-collect --no-verify-jwt
supabase functions deploy campay-status --no-verify-jwt


## STEP 4 — RUN THE SQL MIGRATION
# ═════════════════════════════════
# Go to: https://supabase.com → Your Project → SQL Editor → New Query
# Paste the ENTIRE contents of: sql/payment_tables.sql
# Click "Run"
# You should see: "Success. No rows returned"


## STEP 5 — TEST THE EDGE FUNCTIONS
# ══════════════════════════════════
# In PowerShell, test that the functions are deployed and working:

# Test campay-collect (replace YOUR_SUPABASE_URL and YOUR_ANON_KEY):
$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer YOUR_SUPABASE_ANON_KEY"
    "apikey"        = "YOUR_SUPABASE_ANON_KEY"
}

$body = @{
    amount             = "100"
    currency           = "XAF"
    from               = "237670757326"
    description        = "Test payment"
    external_reference = "test_001"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://YOUR_PROJECT_REF.supabase.co/functions/v1/campay-collect" `
    -Method POST `
    -Headers $headers `
    -Body $body

# ✅ Expected: { reference: "...", ... }
# ❌ If you see { error: "Payment service not configured" }
#    → Your CAMPAY_USERNAME / CAMPAY_PASSWORD secrets are not set (go back to Step 3)
#
# ❌ If you see { error: "CamPay auth failed" }
#    → Your CamPay credentials are wrong — check campay.net/en/developer → App Keys


## STEP 6 — UPDATE CART TO USE NEW CHECKOUT
# ═══════════════════════════════════════════
# In your Cart.tsx, change the checkout navigation to pass state:
#
# OLD code (probably something like):
#   navigate('/checkout-advanced')
#   // or
#   navigate('/payment/checkout')
#
# NEW code — replace with:
#   navigate('/payment/checkout', {
#     state: {
#       items: cartItems,
#       subtotal: subtotal,
#       deliveryFee: 2000,
#       total: subtotal + 2000,
#       deliveryAddress: userAddress,
#       context: 'cart',
#     }
#   });
#
# The PaymentCheckout page reads this state and handles the CamPay payment.


## STEP 7 — UPDATE APP.TSX ROUTES
# ═════════════════════════════════
# Make sure PaymentCheckout is registered in App.tsx.
# Find the payment routes section and verify this exists:
#
#   const PaymentCheckout = lazy(() => import('@/pages/payment/PaymentCheckout'));
#
# And in the Routes:
#   <Route path="/payment/checkout" element={
#     <MainLayout><AuthGate require="user"><PaymentCheckout /></AuthGate></MainLayout>
#   } />
#
# (This should already be in your App.tsx — verify it points to the new file)


## STEP 8 — BUILD AND DEPLOY FRONTEND
# ═════════════════════════════════════
# In PowerShell from C:\Dev\bambe-android:
npm run build

# If no errors, deploy to Netlify:
# Either push to your GitHub branch (if Netlify auto-deploys)
# Or use Netlify CLI: npx netlify deploy --prod --dir=dist


## STEP 9 — VERIFY END-TO-END PAYMENT
# ═════════════════════════════════════
# 1. Open bambeh.com on your phone
# 2. Go to Subscribe → Daily Pass (100 XAF)  
# 3. Enter your MTN or Orange number
# 4. Tap "Subscribe — 100 XAF"
# 5. You should receive a USSD prompt on your phone within 5-10 seconds
# 6. Enter your PIN to approve
# 7. The app should show "Access Unlocked! 🎉" within 30 seconds of approval
#
# ✅ If this works, your payment system is fully fixed.
# ❌ If you see "Payment Error" — check the Supabase Edge Function logs:
#    Supabase Dashboard → Edge Functions → campay-collect → Logs


## STEP 10 — OPTIONAL: KEEP RENDER SERVER FOR WEBHOOKS ONLY
# ═══════════════════════════════════════════════════════════
# Your Render server (bambeh-payment-server.onrender.com) can still be used
# to receive CamPay webhooks (callback_url). This is optional — the polling
# approach in the Edge Functions works without webhooks.
#
# If you want to configure the webhook:
#   1. In your campay.net dashboard → your app → set Webhook URL to:
#      https://bambeh-payment-server.onrender.com/api/campay/webhook
#   2. Keep the Render server deployed so it can receive webhook callbacks
#   3. The webhook can update your Supabase DB when CamPay pushes status updates
#
# For now, the polling approach (every 3s via campay-status Edge Function)
# works reliably without needing a webhook server.


## TROUBLESHOOTING
# ════════════════
# Q: "campay-collect is not a function" / 404 error
# A: Function not deployed. Run: supabase functions deploy campay-collect --no-verify-jwt
#
# Q: "Payment service not configured"
# A: Secrets not set. Go to Supabase Dashboard → Edge Functions → Secrets
#
# Q: "CamPay auth failed" / 401 error from CamPay
# A: Wrong credentials. In campay.net → Developer → your app → App Keys
#    Copy the "Application Username" and "Application Password" (NOT your login)
#
# Q: "Invalid phone number"
# A: Number must start with 237, be 12 digits total, e.g. 237670757326
#    The widget prepends 237 automatically so users enter just 9 digits
#
# Q: Payment initiated but USSD never appears on phone
# A: Check that the phone number belongs to an active MTN/Orange account.
#    Test with 100 XAF minimum. Check CamPay dashboard for transaction log.
#
# Q: Status stays "PENDING" for more than 2 minutes
# A: User didn't approve the USSD. Or the USSD appeared but was dismissed.
#    Ask user to check for pending USSD codes: *126# (MTN) or #150# (Orange)
