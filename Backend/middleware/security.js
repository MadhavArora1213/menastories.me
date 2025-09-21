const crypto = require('crypto');
const { SecurityLog, ThreatIntelligence } = require('../models');

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Security configuration
const SECURITY_CONFIG = {
  maxRequestsPerMinute: 100,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  suspiciousPatterns: [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\bunion\b.*\bselect\b/i,
    /\bscript\b/i,
    /eval\(/i,
    /base64,/i,
    /data:text/i
  ],
  blockedIPs: new Set(), // In production, load from database
  trustedUserAgents: [
    'Mozilla/',
    'Chrome/',
    'Safari/',
    'Firefox/',
    'Edge/'
  ]
};

// Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= maxRequests) {
      // Log rate limit violation
      logSecurityEvent({
        eventType: 'rate_limit_exceeded',
        severity: 'medium',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestData: {
          method: req.method,
          url: req.url,
          path: req.path
        },
        metadata: {
          requestCount: validRequests.length,
          limit: maxRequests
        }
      });

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    rateLimitStore.set(key, validRequests);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - validRequests.length),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });

    next();
  };
};

// IP blocking middleware
const ipBlocker = (req, res, next) => {
  const clientIP = req.ip;

  if (SECURITY_CONFIG.blockedIPs.has(clientIP)) {
    logSecurityEvent({
      eventType: 'blocked_ip_access',
      severity: 'high',
      ipAddress: clientIP,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        path: req.path
      }
    });

    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP address.'
    });
  }

  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    // Remove potential XSS payloads
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// SQL injection detection middleware
const sqlInjectionDetector = (req, res, next) => {
  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;

    const sqlPatterns = [
      /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\-\-)|(\#)|(\;)|(\*\/)|(\*))/,
      /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\#)|(\;)|(\*\/)|(\*))/,
      /(1=1|1=0)/,
      /('|(\\x27)|(\\x2D\\x2D)|(\#)|(\;)|(\*\/)|(\*))/
    ];

    return sqlPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj) => {
    if (typeof obj === 'string') {
      return checkForSQLInjection(obj);
    } else if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    } else if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    return false;
  };

  const hasSQLInjection = checkObject(req.body) || checkObject(req.query) || checkObject(req.params);

  if (hasSQLInjection) {
    logSecurityEvent({
      eventType: 'sql_injection_attempt',
      severity: 'critical',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
      }
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid request detected.'
    });
  }

  next();
};

// XSS detection middleware
const xssDetector = (req, res, next) => {
  const checkForXSS = (value) => {
    if (typeof value !== 'string') return false;

    return SECURITY_CONFIG.suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj) => {
    if (typeof obj === 'string') {
      return checkForXSS(obj);
    } else if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    } else if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    return false;
  };

  const hasXSS = checkObject(req.body) || checkObject(req.query) || checkObject(req.params);

  if (hasXSS) {
    logSecurityEvent({
      eventType: 'xss_attempt',
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
      }
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid request detected.'
    });
  }

  next();
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;

  if (!csrfToken) {
    logSecurityEvent({
      eventType: 'csrf_attempt',
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: {
        method: req.method,
        url: req.url
      }
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF token missing.'
    });
  }

  // In production, validate the token against session
  // For now, just check if it's present
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  });

  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log the request
  logSecurityEvent({
    eventType: 'api_request',
    severity: 'low',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    requestData: {
      method: req.method,
      url: req.url,
      path: req.path,
      headers: {
        'user-agent': req.get('User-Agent'),
        'accept': req.get('Accept'),
        'content-type': req.get('Content-Type'),
        'referer': req.get('Referer')
      }
    }
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    if (res.statusCode >= 400) {
      logSecurityEvent({
        eventType: 'api_error',
        severity: res.statusCode >= 500 ? 'high' : 'medium',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestData: {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration
        }
      });
    }
  });

  next();
};

// User agent validation middleware
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');

  if (!userAgent) {
    logSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'medium',
      ipAddress: req.ip,
      requestData: {
        method: req.method,
        url: req.url,
        reason: 'missing_user_agent'
      }
    });

    return res.status(400).json({
      success: false,
      message: 'User agent required.'
    });
  }

  // Check for suspicious user agents
  const suspiciousPatterns = [
    /^$/,
    /^-$/,
    /^unknown$/i,
    /^null$/i,
    /bot|crawler|spider|scraper/i,
    /python|curl|wget|postman/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious) {
    logSecurityEvent({
      eventType: 'suspicious_user_agent',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent,
      requestData: {
        method: req.method,
        url: req.url
      }
    });
  }

  next();
};

// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
  if (!req.files && !req.file) return next();

  const files = req.files || [req.file];
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  for (const file of files) {
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      logSecurityEvent({
        eventType: 'file_upload_attempt',
        severity: 'high',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestData: {
          method: req.method,
          url: req.url,
          fileType: file.mimetype,
          fileName: file.originalname
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid file type.'
      });
    }

    // Check file size
    if (file.size > maxFileSize) {
      logSecurityEvent({
        eventType: 'large_file_upload',
        severity: 'medium',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestData: {
          method: req.method,
          url: req.url,
          fileSize: file.size,
          maxSize: maxFileSize
        }
      });

      return res.status(400).json({
        success: false,
        message: 'File too large.'
      });
    }

    // Check for malicious file content (basic check)
    const buffer = file.buffer || file.data;
    if (buffer) {
      const magicBytes = buffer.slice(0, 4).toString('hex');

      // Check for executable files
      if (magicBytes === '4d5a9000' || magicBytes.startsWith('7f454c46')) {
        logSecurityEvent({
          eventType: 'malware_detected',
          severity: 'critical',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestData: {
            method: req.method,
            url: req.url,
            fileName: file.originalname,
            magicBytes
          }
        });

        return res.status(400).json({
          success: false,
          message: 'File upload blocked for security reasons.'
        });
      }
    }
  }

  next();
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
  // Check for session hijacking attempts
  if (req.session) {
    const currentIP = req.ip;
    const sessionIP = req.session.ip;

    if (sessionIP && sessionIP !== currentIP) {
      logSecurityEvent({
        eventType: 'session_hijacking_attempt',
        severity: 'critical',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestData: {
          method: req.method,
          url: req.url,
          sessionIP,
          currentIP
        }
      });

      // Destroy session
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Session security violation.'
      });
    }

    // Update session IP
    req.session.ip = currentIP;
  }

  next();
};

// Threat intelligence integration
const threatIntelligenceCheck = async (req, res, next) => {
  const clientIP = req.ip;

  try {
    // Check if IP is in threat intelligence database
    const threat = await ThreatIntelligence.findOne({
      where: {
        indicator: clientIP,
        indicatorType: 'ipv4',
        isActive: true
      }
    });

    if (threat) {
      logSecurityEvent({
        eventType: 'threat_intelligence_match',
        severity: threat.severity,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestData: {
          method: req.method,
          url: req.url,
          threatId: threat.id,
          threatType: threat.intelligenceType
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied due to security policy.'
      });
    }
  } catch (error) {
    console.error('Threat intelligence check failed:', error);
  }

  next();
};

// Helper function to log security events
const logSecurityEvent = async (eventData) => {
  try {
    await SecurityLog.create({
      ...eventData,
      location: await getGeoLocation(eventData.ipAddress),
      deviceInfo: parseUserAgent(eventData.userAgent)
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Helper function to get geolocation (mock implementation)
const getGeoLocation = async (ip) => {
  // In production, integrate with a geolocation service
  return {
    country: 'Unknown',
    city: 'Unknown',
    coordinates: { lat: 0, lng: 0 }
  };
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  if (!userAgent) return {};

  return {
    browser: userAgent.includes('Chrome') ? 'Chrome' :
             userAgent.includes('Firefox') ? 'Firefox' :
             userAgent.includes('Safari') ? 'Safari' :
             userAgent.includes('Edge') ? 'Edge' : 'Unknown',
    os: userAgent.includes('Windows') ? 'Windows' :
        userAgent.includes('Mac') ? 'macOS' :
        userAgent.includes('Linux') ? 'Linux' :
        userAgent.includes('Android') ? 'Android' :
        userAgent.includes('iOS') ? 'iOS' : 'Unknown',
    device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  };
};

module.exports = {
  rateLimit,
  ipBlocker,
  sanitizeInput,
  sqlInjectionDetector,
  xssDetector,
  csrfProtection,
  securityHeaders,
  requestLogger,
  validateUserAgent,
  fileUploadSecurity,
  sessionSecurity,
  threatIntelligenceCheck,
  logSecurityEvent
};