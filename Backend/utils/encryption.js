const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltRounds: 12,
  pbkdf2: {
    iterations: 100000,
    keyLength: 32,
    digest: 'sha256'
  }
};

// Generate encryption key from password
function generateKeyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    ENCRYPTION_CONFIG.pbkdf2.iterations,
    ENCRYPTION_CONFIG.pbkdf2.keyLength,
    ENCRYPTION_CONFIG.pbkdf2.digest
  );
}

// Generate random encryption key
function generateEncryptionKey() {
  return crypto.randomBytes(ENCRYPTION_CONFIG.keyLength);
}

// Generate random salt
function generateSalt() {
  return crypto.randomBytes(16);
}

// Generate random IV
function generateIV() {
  return crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
}

// Encrypt data
function encryptData(data, key) {
  try {
    const iv = generateIV();
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ENCRYPTION_CONFIG.algorithm
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data
function decryptData(encryptedData, key) {
  try {
    const { encrypted, iv, authTag, algorithm } = encryptedData;

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Hash password
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(ENCRYPTION_CONFIG.saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

// Verify password
async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    throw new Error('Failed to verify password');
  }
}

// Generate secure token
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('base64');
}

// Hash sensitive data (one-way)
function hashSensitiveData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Encrypt file data
function encryptFile(buffer, key) {
  try {
    const iv = generateIV();
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ENCRYPTION_CONFIG.algorithm
    };
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
}

// Decrypt file data
function decryptFile(encryptedData, key) {
  try {
    const { encrypted, iv, authTag, algorithm } = encryptedData;

    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final()
    ]);

    return decrypted;
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
}

// Generate HMAC for data integrity
function generateHMAC(data, key) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

// Verify HMAC
function verifyHMAC(data, key, hmac) {
  const calculatedHMAC = generateHMAC(data, key);
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHMAC, 'hex'),
    Buffer.from(hmac, 'hex')
  );
}

// Encrypt database fields
function encryptDatabaseField(value, encryptionKey) {
  if (!value) return value;

  const encrypted = encryptData(value, encryptionKey);
  return JSON.stringify(encrypted);
}

// Decrypt database fields
function decryptDatabaseField(encryptedValue, encryptionKey) {
  if (!encryptedValue) return encryptedValue;

  try {
    const encryptedData = JSON.parse(encryptedValue);
    return decryptData(encryptedData, encryptionKey);
  } catch (error) {
    console.error('Database field decryption error:', error);
    return null;
  }
}

// Generate secure random string
function generateSecureRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// Validate encryption key strength
function validateEncryptionKey(key) {
  if (!key || key.length < ENCRYPTION_CONFIG.keyLength) {
    throw new Error(`Encryption key must be at least ${ENCRYPTION_CONFIG.keyLength} bytes`);
  }

  // Check for weak patterns
  const keyString = key.toString();
  const weakPatterns = [
    /^0+$/, // All zeros
    /^1+$/, // All ones
    /^(.)\1+$/, // Repeated character
    /^0123456789/, // Sequential numbers
    /^abcdefghijklmnopqrstuvwxyz/i // Sequential letters
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(keyString)) {
      throw new Error('Encryption key is too weak');
    }
  }

  return true;
}

// Rotate encryption keys (for key management)
function rotateEncryptionKey(oldKey, newKey, encryptedData) {
  try {
    // Decrypt with old key
    const decrypted = decryptData(encryptedData, oldKey);

    // Encrypt with new key
    const reEncrypted = encryptData(decrypted, newKey);

    return reEncrypted;
  } catch (error) {
    console.error('Key rotation error:', error);
    throw new Error('Failed to rotate encryption key');
  }
}

module.exports = {
  generateEncryptionKey,
  generateSalt,
  generateIV,
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateCSRFToken,
  hashSensitiveData,
  encryptFile,
  decryptFile,
  generateHMAC,
  verifyHMAC,
  encryptDatabaseField,
  decryptDatabaseField,
  generateSecureRandomString,
  validateEncryptionKey,
  rotateEncryptionKey,
  ENCRYPTION_CONFIG
};