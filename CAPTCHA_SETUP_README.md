# Google reCAPTCHA Setup Guide

## Why the CAPTCHA Shows "For testing purposes"

The CAPTCHA was initially configured with Google's test site key, which displays "For testing purposes only" and doesn't provide real security. For production use, you need to get your own reCAPTCHA keys from Google.

## Step-by-Step Setup

### 1. Create a Google reCAPTCHA Account

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account
3. Click "Create" to register a new site

### 2. Configure reCAPTCHA

1. **Label**: Enter a name for your site (e.g., "Magazine Website")
2. **reCAPTCHA type**: Choose **reCAPTCHA v2** → "I'm not a robot" Checkbox
3. **Domains**: Add your domain(s):
   - For development: `localhost`
   - For production: `yourdomain.com`
   - You can add multiple domains separated by new lines

### 3. Get Your Keys

After creating the site, you'll get:
- **Site Key** (public key) - used in frontend
- **Secret Key** (private key) - used in backend

### 4. Configure Environment Variables

#### Frontend (.env file in Magazine_Website folder):
```env
REACT_APP_RECAPTCHA_SITE_KEY=your_actual_site_key_here
```

#### Backend (.env file in Backend folder):
```env
RECAPTCHA_SECRET_KEY=your_actual_secret_key_here
```

### 5. Update Your .env Files

1. Copy the Site Key to `Magazine_Website/.env`
2. Copy the Secret Key to `Backend/.env`

### 6. Restart Your Application

After updating the environment variables:
```bash
# Restart frontend
cd Magazine_Website
npm start

# Restart backend
cd Backend
npm start
```

## Verification

Once configured correctly:
- ✅ CAPTCHA will show your domain name instead of "For testing purposes"
- ✅ Real security validation will be active
- ✅ Forms will properly verify users before submission

## Troubleshooting

### CAPTCHA Still Shows "For testing purposes"
- Check that you've added the correct Site Key to `REACT_APP_RECAPTCHA_SITE_KEY`
- Ensure the domain is registered in Google reCAPTCHA admin
- Clear browser cache and restart the application

### CAPTCHA Not Working
- Verify both Site Key and Secret Key are correct
- Check that the domain matches exactly (including www. if used)
- Ensure environment variables are loaded properly

### Backend Validation Issues
- Make sure the Secret Key is set in the backend environment
- Check backend logs for reCAPTCHA verification errors

## Security Notes

- Never commit your Secret Key to version control
- Keep your Secret Key secure and don't share it
- Regularly rotate your keys if you suspect compromise
- Monitor your reCAPTCHA usage in the Google admin console

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Verify environment variables are loaded
3. Test with Google's reCAPTCHA demo keys first
4. Check Google reCAPTCHA status page for outages