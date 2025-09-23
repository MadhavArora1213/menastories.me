import React, { useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Captcha = ({ onVerify, onExpired, siteKey }) => {
  const recaptchaRef = useRef(null);

  // IMPORTANT: You need to get your own reCAPTCHA site key from Google
  // 1. Go to https://www.google.com/recaptcha/admin
  // 2. Register your domain
  // 3. Choose reCAPTCHA v2 "I'm not a robot" Checkbox
  // 4. Copy the Site Key and replace the value below
  // 5. Also add the Secret Key to your backend environment variables

  const defaultSiteKey = siteKey || import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY_HERE';

  // Debug logging for development
  useEffect(() => {
    console.log('Captcha Debug Info:', {
      siteKey: defaultSiteKey,
      isConfigured: defaultSiteKey !== 'YOUR_RECAPTCHA_SITE_KEY_HERE',
      envVar: import.meta.env.VITE_RECAPTCHA_SITE_KEY
    });
  }, [defaultSiteKey]);

  const handleVerify = (token) => {
    try {
      if (onVerify) {
        onVerify(token);
      }
    } catch (error) {
      console.error('Captcha verification error:', error);
    }
  };

  const handleExpired = () => {
    try {
      if (onExpired) {
        onExpired();
      }
    } catch (error) {
      console.error('Captcha expired error:', error);
    }
  };

  const handleError = (error) => {
    console.error('Captcha error:', error);
    // Don't break the form, just log the error
  };

  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  if (defaultSiteKey === 'YOUR_RECAPTCHA_SITE_KEY_HERE' || !defaultSiteKey) {
    return (
      <div className="captcha-container">
        <div style={{
          padding: '20px',
          border: '2px dashed #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          textAlign: 'center',
          color: '#d63031'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>⚠️ CAPTCHA Not Configured</h3>
          <p style={{ margin: '0', fontSize: '14px' }}>
            Please configure Google reCAPTCHA:
          </p>
          <ol style={{ textAlign: 'left', margin: '10px 0', fontSize: '12px' }}>
            <li>Go to <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" style={{ color: '#0984e3' }}>Google reCAPTCHA Admin</a></li>
            <li>Register your domain</li>
            <li>Choose reCAPTCHA v2 "I'm not a robot" Checkbox</li>
            <li>Copy Site Key and add to environment variables</li>
            <li>Add Secret Key to backend environment</li>
          </ol>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#636e72' }}>
            Set VITE_RECAPTCHA_SITE_KEY in your .env file
          </p>
          <div style={{ marginTop: '15px' }}>
            <button
              type="button"
              onClick={() => {
                // Allow form submission without CAPTCHA for development
                if (onVerify) {
                  onVerify('development-bypass-token');
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0984e3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Bypass for Development
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="captcha-container">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={defaultSiteKey}
        onChange={handleVerify}
        onExpired={handleExpired}
        onError={handleError}
        theme="light"
        size="normal"
      />
      <style jsx>{`
        .captcha-container {
          display: flex;
          justify-content: center;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default Captcha;