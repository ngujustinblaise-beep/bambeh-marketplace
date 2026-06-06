# Payment Issues Identified

## 1. Payment server returning "Host not in allowlist"
- The Render server has a CORS/allowlist check that blocks our requests
- Likely an environment variable for ALLOWED_ORIGINS is misconfigured

## 2. Render free tier cold start
- Free tier spins down after 15 min of inactivity
- First request takes 30-60s => CamPay webhook times out => payment fails

## 3. CamPay webhook flow broken
- SubscriptionPlans.tsx calls initiateSubscription() which calls Render
- Render calls CamPay API to initiate mobile money payment
- CamPay sends USSD push to user phone
- CamPay calls back webhook on our Render server when payment confirmed
- If Render is sleeping during webhook callback => payment recorded as failed

## 4. ZermPurchase.tsx - No real payment initiation
- Currently just inserts a 'pending' record in Supabase
- Never actually calls CamPay or the payment server
- No payment prompt is ever sent to the user's phone

## 5. DonatePremium, Cart - Not connected to CamPay at all

## 6. Multiple payment systems causing confusion
- CheckoutAdvanced uses PaymentGatewayADVANCED (unknown component)
- SubscriptionPlans uses initiateSubscription hook
- ZermPurchase goes direct to Supabase (bypasses payment)
- No unified payment module
