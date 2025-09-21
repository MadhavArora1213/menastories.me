import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaKey, FaCopy, FaCheck, FaQrcode, FaShieldAlt } from 'react-icons/fa';
import QRCode from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MFASetup = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Backup Codes
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState({});
  const [qrCodeError, setQrCodeError] = useState(false);

  const { setupMfa, verifyMfa, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Initialize MFA setup on component mount
  useEffect(() => {
    initializeMfaSetup();
  }, []);

  const initializeMfaSetup = async () => {
    try {
      clearError();
      setQrCodeError(false);
      const response = await setupMfa();
      setQrCodeUrl(response.qrCode);
      setSecretKey(response.secret);
      setOtpauthUrl(response.otpauthUrl || '');
    } catch (error) {
      console.error('MFA setup initialization error:', error);
      setQrCodeError(true);
      // If QR code generation fails, we'll still have the secret key for manual entry
      if (error.message && error.message.includes('Data too long')) {
        toast.error('QR code data is too long. Please use the manual entry key below.');
      }
    }
  };

  const handleVerification = async (data) => {
    try {
      clearError();
      const response = await verifyMfa(data.code);
      setBackupCodes(response.backupCodes);
      setStep(3);
      toast.success('MFA enabled successfully!');
    } catch (error) {
      console.error('MFA verification error:', error);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else if (type === 'codes') {
        const newCopiedCodes = {};
        backupCodes.forEach((_, index) => {
          newCopiedCodes[index] = true;
        });
        setCopiedCodes(newCopiedCodes);
        setTimeout(() => setCopiedCodes({}), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyBackupCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodes({ ...copiedCodes, [index]: true });
      setTimeout(() => {
        setCopiedCodes(prev => ({ ...prev, [index]: false }));
      }, 2000);
      toast.success('Backup code copied!');
    } catch (error) {
      toast.error('Failed to copy backup code');
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded!');
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Step 1: Setup */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <FaShieldAlt className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Set up Multi-Factor Authentication
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <h4 className="font-medium mb-2">Step 1: Install an authenticator app</h4>
              <p className="mb-2">Download one of these apps on your phone:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Google Authenticator (iOS/Android)</li>
                <li>Authy (iOS/Android/Desktop)</li>
                <li>Microsoft Authenticator (iOS/Android)</li>
                <li>1Password (iOS/Android/Desktop)</li>
              </ul>
            </div>

            <div className="text-sm text-gray-700">
              <h4 className="font-medium mb-2">Step 2: Scan the QR code or enter manually</h4>
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  {qrCodeUrl && !qrCodeError ? (
                    <div className="flex flex-col items-center">
                      <QRCode
                        value={qrCodeUrl}
                        size={200}
                        onError={(error) => {
                          console.error('QR Code generation error:', error);
                          setQrCodeError(true);
                        }}
                      />
                      <p className="text-xs text-green-600 mt-2 text-center">
                        ✅ QR code ready to scan
                      </p>
                    </div>
                  ) : qrCodeError || !qrCodeUrl ? (
                    <div className="flex flex-col items-center justify-center w-[200px] h-[200px] bg-yellow-50 border-2 border-dashed border-yellow-300 rounded">
                      <FaQrcode className="h-12 w-12 text-yellow-500 mb-2" />
                      <p className="text-xs text-yellow-700 text-center px-2">
                        QR code unavailable.<br />Use manual entry below.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-[200px] h-[200px] bg-gray-100 rounded">
                      <FaSpinner className="animate-spin h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Alternative setup methods */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Alternative Setup Methods:</h5>
                  <div className="space-y-2 text-xs text-blue-800">
                    <p><strong>1. QR Code:</strong> Scan with your authenticator app</p>
                    <p><strong>2. Manual Entry:</strong> Copy the secret key below</p>
                    {otpauthUrl && (
                      <p><strong>3. Full URL:</strong> Copy the complete setup URL</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700">
              <h4 className="font-medium mb-2">Manual Entry Options:</h4>
              <div className="space-y-3">
                {/* Secret Key */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Secret Key (Recommended):
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-xs font-mono break-all">
                      {secretKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(secretKey, 'secret')}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy secret key"
                    >
                      {copiedSecret ? (
                        <FaCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <FaCopy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Full OTP Auth URL (if available) */}
                {otpauthUrl && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Complete Setup URL (Alternative):
                    </label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                      <code className="flex-1 text-xs font-mono break-all">
                        {otpauthUrl}
                      </code>
                      <button
                        onClick={() => copyToClipboard(otpauthUrl, 'url')}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy full URL"
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!qrCodeUrl}
              className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Verify */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FaKey className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Verify your setup
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleVerification)} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                {...register('code', {
                  required: 'Verification code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Please enter a 6-digit code',
                  },
                })}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono tracking-wider"
                placeholder="000000"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                Verify & Enable
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Backup Codes */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FaCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              MFA Enabled Successfully!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Save these backup codes in a safe place
            </p>
          </div>

          <div className="rounded-md bg-yellow-50 p-4">
            <div className="text-sm text-yellow-800">
              <h4 className="font-medium">Important:</h4>
              <p className="mt-1">
                These backup codes can be used to access your account if you lose your authenticator device. 
                Each code can only be used once.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-900">Backup Codes</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
                  className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Copy All
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <code className="text-xs font-mono">{code}</code>
                  <button
                    onClick={() => copyBackupCode(code, index)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy code"
                  >
                    {copiedCodes[index] ? (
                      <FaCheck className="h-3 w-3 text-green-500" />
                    ) : (
                      <FaCopy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-800">
              <h4 className="font-medium">What's next?</h4>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Store these backup codes in a password manager</li>
                <li>Print them and store in a secure location</li>
                <li>Test your authenticator app on next login</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
};

export default MFASetup;