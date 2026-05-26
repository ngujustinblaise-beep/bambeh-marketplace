# 🗺️ GOOGLE MAPS API SETUP GUIDE

## Bambeh Marketplace - Complete Google Maps Integration

---

## STEP 1: CREATE GOOGLE CLOUD PROJECT

### 1.1 Go to Google Cloud Console

- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create New Project

1. Click **Select a project** dropdown (top left)
2. Click **NEW PROJECT**
3. Enter project details:
   - **Project name**: `Bambeh-Marketplace`
   - **Organization**: Leave as default
   - **Location**: Leave as default
4. Click **CREATE**
5. Wait for project creation (30-60 seconds)

---

## STEP 2: ENABLE REQUIRED APIs

### 2.1 Navigate to APIs & Services

1. In the left sidebar, click **APIs & Services**
2. Click **Library**

### 2.2 Enable Maps JavaScript API

1. Search for: `Maps JavaScript API`
2. Click on the result
3. Click **ENABLE**
4. Wait for activation

### 2.3 Enable Places API

1. Go back to Library
2. Search for: `Places API`
3. Click on the result
4. Click **ENABLE**

### 2.4 Enable Directions API

1. Go back to Library
2. Search for: `Directions API`
3. Click on the result
4. Click **ENABLE**

### 2.5 Enable Geocoding API

1. Go back to Library
2. Search for: `Geocoding API`
3. Click on the result
4. Click **ENABLE**

### 2.6 Enable Geolocation API

1. Go back to Library
2. Search for: `Geolocation API`
3. Click on the result
4. Click **ENABLE**

**✅ VERIFICATION**: You should now have 5 APIs enabled.

---

## STEP 3: CREATE API KEY

### 3.1 Navigate to Credentials

1. In the left sidebar, click **Credentials**
2. Click **+ CREATE CREDENTIALS** (top)
3. Select **API key**

### 3.2 Copy Your API Key

1. A popup will show your new API key
2. **IMPORTANT**: Copy this key immediately
3. Example format: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3.3 Restrict API Key (IMPORTANT FOR SECURITY!)

1. Click **RESTRICT KEY** in the popup
2. Under **Application restrictions**:
   - Select **HTTP referrers (websites)**
   - Click **ADD AN ITEM**
   - Add: `http://localhost:3000/*` (for development)
   - Add: `https://yourdomain.com/*` (for production)
   - Add: `https://*.yourdomain.com/*` (for subdomains)

3. Under **API restrictions**:
   - Select **Restrict key**
   - Check these APIs:
     ✓ Maps JavaScript API
     ✓ Places API
     ✓ Directions API
     ✓ Geocoding API
     ✓ Geolocation API

4. Click **SAVE**

**✅ VERIFICATION**: Your API key is now created and restricted.

---

## STEP 4: CONFIGURE BILLING (REQUIRED!)

### 4.1 Set Up Billing Account

1. In the left sidebar, click **Billing**
2. Click **LINK A BILLING ACCOUNT**
3. Click **CREATE BILLING ACCOUNT**
4. Enter your billing information:
   - Country
   - Payment method (Credit/Debit card)
5. Click **START MY FREE TRIAL**

### 4.2 Free Tier Information

Google Maps provides:

- **$200 FREE CREDITS per month**
- Covers approximately:
  - 28,000 map loads
  - 40,000 directions requests
  - 100,000 geocoding requests

**Note**: You won't be charged unless you exceed free tier limits AND enable auto-billing.

**✅ VERIFICATION**: Billing account is active.

---

## STEP 5: UPDATE BAMBEH CONFIGURATION

### 5.1 Open Your Project

```cmd
cd C:\Users\YourUsername\BambehApp
```

### 5.2 Update Environment Configuration

Open file: `src\advanced-features\config\env.config.ts`

Find this line:

```typescript
API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
```

Replace with your actual API key:

```typescript
API_KEY: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your actual key
```

### 5.3 Save the File

Press `Ctrl + S` to save

**✅ VERIFICATION**: API key is configured in your app.

---

## STEP 6: ADD GOOGLE MAPS TO index.html

### 6.1 Open index.html

Navigate to: `public\index.html`

### 6.2 Add Google Maps Script

Add this line in the `<head>` section:

```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places,geometry,drawing"
  async
  defer
></script>
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

### 6.3 Save the File

**✅ VERIFICATION**: Google Maps script is added to your HTML.

---

## STEP 7: TEST GOOGLE MAPS INTEGRATION

### 7.1 Start Development Server

```cmd
npm start
```

### 7.2 Open Browser Console

1. Press `F12` to open developer tools
2. Go to **Console** tab

### 7.3 Check for Errors

- ✓ **No errors**: Google Maps is working!
- ✗ **"InvalidKeyMapError"**: Check your API key
- ✗ **"RefererNotAllowedMapError"**: Check your API restrictions
- ✗ **Billing errors**: Verify billing is enabled

### 7.4 Test GPS Tracking Component

Navigate to a page that uses GPS tracking and verify:

- Map loads correctly
- Your location appears
- Markers are visible
- Routes can be calculated

**✅ VERIFICATION**: Google Maps is fully functional!

---

## STEP 8: PRODUCTION DEPLOYMENT

### 8.1 Update API Key Restrictions

When deploying to production:

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Add your production domain to HTTP referrers:
   - `https://bambeh.cm/*`
   - `https://*.bambeh.cm/*`
4. Click **SAVE**

### 8.2 Environment Variables (Recommended)

For security, use environment variables:

Create `.env` file in project root:

```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Update `env.config.ts`:

```typescript
API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_FALLBACK_KEY',
```

**✅ VERIFICATION**: Production setup complete!

---

## TROUBLESHOOTING

### Error: "This page can't load Google Maps correctly"

**Solution**:

- Verify billing is enabled
- Check API key is correct
- Confirm APIs are enabled

### Error: "RefererNotAllowedMapError"

**Solution**:

- Add your domain to API key restrictions
- For localhost: Add `http://localhost:3000/*`

### Map shows gray tiles

**Solution**:

- Check internet connection
- Verify API key is valid
- Ensure Maps JavaScript API is enabled

### Directions not working

**Solution**:

- Enable Directions API
- Check API key restrictions include Directions API

---

## MONITORING & QUOTAS

### View API Usage

1. Go to Google Cloud Console
2. Click **APIs & Services** > **Dashboard**
3. View usage graphs for each API

### Set Up Alerts

1. Go to **Billing** > **Budgets & alerts**
2. Click **CREATE BUDGET**
3. Set monthly budget (e.g., $200)
4. Set alert threshold (e.g., 50%, 90%, 100%)
5. Add your email for notifications

---

## COST OPTIMIZATION TIPS

1. **Enable caching**: Reduce repeated API calls
2. **Use static maps**: For non-interactive displays
3. **Batch requests**: Combine multiple requests when possible
4. **Set zoom limits**: Prevent excessive tile loading
5. **Monitor usage**: Check dashboard weekly

---

## SECURITY BEST PRACTICES

1. ✓ **Always restrict API keys**
2. ✓ **Never commit API keys to GitHub**
3. ✓ **Use environment variables in production**
4. ✓ **Rotate keys periodically**
5. ✓ **Monitor for unusual activity**
6. ✓ **Set up billing alerts**

---

## SUPPORT & RESOURCES

- **Google Maps Documentation**: https://developers.google.com/maps/documentation
- **Stack Overflow**: Tag your questions with `google-maps-api`
- **Pricing Calculator**: https://mapsplatform.google.com/pricing/
- **Support**: https://cloud.google.com/support

---

**🎉 CONGRATULATIONS!**
Your Google Maps integration is now complete and ready for production use!

For any issues, refer to this guide or contact Google Cloud Support.

---

_Last Updated: December 2024_
_Bambeh Marketplace v1.0.0_
