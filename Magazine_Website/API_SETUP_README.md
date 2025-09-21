# API Configuration Guide

This guide explains how to set up all the required API keys for the Magazine Website.

## 🚀 Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in the `.env` file

3. Restart your development server

## 📋 Required API Keys

### 1. WeatherAPI.com (Weather Data)
- **Purpose**: Real-time weather information for Dubai
- **Sign up**: https://www.weatherapi.com/my/
- **Plan**: Free tier (1,000,000 calls/month)
- **Environment Variable**: `VITE_WEATHERAPI_KEY`

### 2. Alpha Vantage API (Stock Market Data)
- **Purpose**: Real-time stock prices and market data
- **Sign up**: https://www.alphavantage.co/support/#api-key
- **Plan**: Free tier (5 calls/minute, 500 calls/day)
- **Environment Variable**: `VITE_ALPHA_VANTAGE_API_KEY`

### 3. Backend API Configuration
- **Purpose**: Connection to your backend server
- **Default**: `http://localhost:5000`
- **Environment Variable**: `VITE_API_URL`

## 🔧 Optional API Keys

### Email Configuration (for Newsletter)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password_here
```

### Social Media APIs
```env
FACEBOOK_APP_ID=your_facebook_app_id_here
TWITTER_API_KEY=your_twitter_api_key_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
```

### Analytics
```env
GOOGLE_ANALYTICS_ID=your_google_analytics_id_here
```

### Payment Gateways
```env
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

### Cloud Storage (AWS S3)
```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name_here
```

## 📝 API Key Instructions

### WeatherAPI.com Setup
1. Go to https://www.weatherapi.com/my/
2. Click "Sign Up" and create a free account
3. Verify your email
4. Go to your dashboard and copy your API key
5. Add it to your `.env` file:
   ```env
   VITE_WEATHERAPI_KEY=your_actual_api_key_here
   ```

### Alpha Vantage Setup
1. Go to https://www.alphavantage.co/support/#api-key
2. Fill out the form to request an API key
3. Check your email for the API key
4. Add it to your `.env` file:
   ```env
   VITE_ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
   ```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor API usage** to avoid exceeding limits
5. **Use environment-specific configurations**

## 🚨 API Limits & Costs

### Free Tier Limits
- **WeatherAPI.com**: 1,000,000 calls/month
- **Alpha Vantage**: 5 calls/minute, 500 calls/day

### Paid Plans (if needed)
- **WeatherAPI.com**: Starts at $4/month for higher limits
- **Alpha Vantage**: Starts at $50/month for premium data

## 🐛 Troubleshooting

### Weather Widget Not Loading
- Check if `VITE_WEATHERAPI_KEY` is set correctly
- Verify the API key is active
- Check browser console for errors

### Stock Ticker Not Updating
- Verify `VITE_ALPHA_VANTAGE_API_KEY` is correct
- Check if you've exceeded daily limits
- Look for API errors in browser console

### Backend Connection Issues
- Ensure `VITE_API_URL` points to the correct backend URL
- Check if backend server is running
- Verify CORS settings

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure API keys are valid and active
4. Check API documentation for rate limits

## 🔄 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:5000` | Backend API URL |
| `VITE_WEATHERAPI_KEY` | Yes | - | Weather API key |
| `VITE_ALPHA_VANTAGE_API_KEY` | Yes | - | Stock market API key |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `DB_*` | Yes | - | Database configuration |
| `EMAIL_*` | No | - | Email service configuration |
| `AWS_*` | No | - | Cloud storage configuration |
| `STRIPE_*` | No | - | Payment processing |