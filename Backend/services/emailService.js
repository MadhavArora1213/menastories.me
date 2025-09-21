const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();

// Set up Brevo client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configure API key authorization
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || process.env.BREVO_API_KEY;

// Send email
exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log('📧 BREVO_API_KEY configured:', !!process.env.BREVO_API_KEY);
    console.log('📧 BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Make sure subject is provided (error shows it's missing)
    sendSmtpEmail.subject = subject || "Magazine Website Update"; // Default subject if none provided

    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || "Magazine Website",
      email: process.env.BREVO_FROM_EMAIL || "madhavarora132005@gmail.com"
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.htmlContent = htmlContent;

    console.log("📧 Sending email with:", { to, subject, contentLength: htmlContent?.length });

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully. Message ID:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ Email sending error:', error.response?.body || error.message);
    console.error('❌ Full error:', error);
    throw new Error('Failed to send email');
  }
};

// Send OTP email
exports.sendOtpEmail = async (to, otp, type = 'newsletter') => {
  let subject;
  if (type === 'signup') {
    subject = 'Verify Your Magazine Website Account';
  } else if (type === 'event submission') {
    subject = 'Verify Your Event Submission';
  } else {
    subject = 'Verify Your Newsletter Subscription';
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">🔐 Verification Code</h1>
        <p style="color: #666; font-size: 16px;">Complete your ${type === 'signup' ? 'account' : type === 'event submission' ? 'event submission' : 'newsletter'} verification</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 40px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
        <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Your Verification Code</h2>

        <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #007bff;">
          <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px;">${otp}</span>
        </div>

        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
          Enter this code to verify your ${type === 'signup' ? 'account' : type === 'event submission' ? 'event submission' : 'newsletter subscription'}.
        </p>

        <p style="color: #999; font-size: 14px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <p style="color: #856404; margin: 0; font-size: 14px;">
          <strong>Security Note:</strong> If you didn't request this verification code, please ignore this email.
          Your account security is important to us.
        </p>
      </div>

      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>This verification code was sent to ${to}</p>
        <p>If you have any questions, please contact us at ${process.env.BREVO_FROM_EMAIL || 'support@magazinewebsite.com'}</p>
      </div>
    </div>
  `;

  return exports.sendEmail(to, subject, htmlContent);
};


// Send newsletter welcome email
exports.sendNewsletterWelcome = async (to) => {
  const subject = 'Welcome to Our Newsletter Community!';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">🎉 Welcome Aboard!</h1>
        <p style="color: #666; font-size: 16px;">You're now part of our newsletter community</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Thank You for Joining Us!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Your subscription has been confirmed! You'll now receive our latest articles, news updates,
          and exclusive content directly in your inbox.
        </p>

        <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">What to Expect:</h3>
          <ul style="color: #666; padding-left: 20px;">
            <li style="margin-bottom: 8px;">📝 Latest articles and featured stories</li>
            <li style="margin-bottom: 8px;">📰 Breaking news and updates</li>
            <li style="margin-bottom: 8px;">🎯 Exclusive content and insights</li>
            <li style="margin-bottom: 8px;">📧 Weekly digest of top stories</li>
            <li style="margin-bottom: 8px;">🎁 Special offers and promotions</li>
          </ul>
        </div>

        <p style="color: #666; line-height: 1.6;">
          We promise to only send you high-quality content that matters to you.
          You can update your preferences or unsubscribe at any time.
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
           style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Explore Our Latest Articles
        </a>
      </div>

      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>You can manage your subscription preferences anytime from your account settings.</p>
        <p>Questions? Contact us at ${process.env.BREVO_FROM_EMAIL || 'support@magazinewebsite.com'}</p>
      </div>
    </div>
  `;

  return exports.sendEmail(to, subject, htmlContent);
};

// Send OTP email for comment verification
exports.sendOtpEmail = async (to, otp, type = 'verification', name = '') => {
  let subject;
  let htmlContent;

  if (type === 'comment verification') {
    subject = 'Verify Your Comment - Magazine Website';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #162048;">Comment Verification</h2>
        <p>Hello ${name},</p>
        <p>Please use the following OTP to verify your comment:</p>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #162048; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `;
  } else {
    // Your existing OTP email logic
    subject = `Your OTP Code - ${type}`;
    htmlContent = `<!-- your existing template -->`;
  }

  return await this.sendEmail(to, subject, htmlContent);
};

// Send newsletter to subscriber
exports.sendNewsletter = async (to, subject, content, subscriber = null) => {
  // Generate unsubscribe token if subscriber provided
  let unsubscribeToken = '';
  if (subscriber && subscriber.unsubscribeToken) {
    unsubscribeToken = subscriber.unsubscribeToken;
  } else {
    // Fallback to email-based unsubscribe if no token
    const crypto = require('crypto');
    unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 10px;">${subject}</h1>
        <div style="color: #666; line-height: 1.6;">
          ${content}
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin-bottom: 10px;">
          You're receiving this because you're subscribed to our newsletter.
        </p>
        <p style="color: #999; font-size: 12px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe/${unsubscribeToken}"
             style="color: #007bff; text-decoration: none;">
            Unsubscribe
          </a>
          |
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/preferences/${unsubscribeToken}"
             style="color: #007bff; text-decoration: none;">
            Update Preferences
          </a>
        </p>
      </div>
    </div>
  `;

  return exports.sendEmail(to, subject, htmlContent);
};

// Send article publication notification
exports.sendArticleNotification = async (to, article) => {
  const subject = `New Article: ${article.title}`;

  const articleUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/articles/${article.slug}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin-bottom: 10px;">📰 New Article Published!</h1>
      </div>

      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 15px;">${article.title}</h2>

        ${article.subtitle ? `<h3 style="color: #666; margin-bottom: 20px;">${article.subtitle}</h3>` : ''}

        ${article.excerpt ? `<p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${article.excerpt}</p>` : ''}

        <div style="text-align: center; margin-top: 25px;">
          <a href="${articleUrl}"
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Read Full Article
          </a>
        </div>
      </div>

      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>You received this notification because you're subscribed to our newsletter.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/preferences"
             style="color: #007bff; text-decoration: none;">
            Update your preferences
          </a>
          |
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(to)}"
             style="color: #007bff; text-decoration: none;">
            Unsubscribe
          </a>
        </p>
      </div>
    </div>
  `;

  return exports.sendEmail(to, subject, htmlContent);
};