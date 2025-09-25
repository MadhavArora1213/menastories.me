import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const CheckIn = ({ eventId, eventTitle, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [checkInCode, setCheckInCode] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [checkedInUsers, setCheckedInUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    // Simulate loading attendees
    const mockAttendees = [
      { id: 1, name: 'John Doe', email: 'john@example.com', registeredAt: '2024-01-15T10:30:00Z' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', registeredAt: '2024-01-15T11:00:00Z' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', registeredAt: '2024-01-15T11:30:00Z' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', registeredAt: '2024-01-15T12:00:00Z' },
    ];
    setAttendees(mockAttendees);
  }, [eventId]);

  const handleCodeCheckIn = async () => {
    if (!checkInCode.trim()) {
      setMessage('Please enter a check-in code');
      return;
    }

    setLoading(true);
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      const attendee = attendees.find(a => a.id.toString() === checkInCode);
      if (attendee && !checkedInUsers.has(attendee.id)) {
        setCheckedInUsers(prev => new Set([...prev, attendee.id]));
        setMessage(`✅ ${attendee.name} checked in successfully!`);
        setCheckInCode('');
      } else if (checkedInUsers.has(attendee?.id)) {
        setMessage('❌ This attendee has already checked in');
      } else {
        setMessage('❌ Invalid check-in code');
      }
      setLoading(false);
    }, 1000);
  };

  const handleManualCheckIn = async () => {
    if (!manualEmail.trim()) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      const attendee = attendees.find(a => a.email.toLowerCase() === manualEmail.toLowerCase());
      if (attendee && !checkedInUsers.has(attendee.id)) {
        setCheckedInUsers(prev => new Set([...prev, attendee.id]));
        setMessage(`✅ ${attendee.name} checked in successfully!`);
        setManualEmail('');
      } else if (checkedInUsers.has(attendee?.id)) {
        setMessage('❌ This attendee has already checked in');
      } else {
        setMessage('❌ Email not found in registration list');
      }
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedInCount = checkedInUsers.size;
  const totalAttendees = attendees.length;
  const checkInPercentage = totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Event Check-In</h2>
            <p className="text-gray-300 text-sm">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{checkedInCount}</div>
              <div className="text-sm text-gray-300">Checked In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalAttendees}</div>
              <div className="text-sm text-gray-300">Total Registered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{checkInPercentage}%</div>
              <div className="text-sm text-gray-300">Check-in Rate</div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-6 py-3 text-sm ${
            message.includes('✅')
              ? 'bg-green-900/50 text-green-200 border-l-4 border-green-500'
              : 'bg-red-900/50 text-red-200 border-l-4 border-red-500'
          }`}>
            {message}
          </div>
        )}

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-200px)]">
          {/* Check-in Methods */}
          <div className="lg:w-1/3 p-6 border-r border-gray-700 bg-gray-800/30">
            <h3 className="text-lg font-semibold text-white mb-4">Check-in Methods</h3>

            {/* Code Check-in */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Check-in Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleCodeCheckIn)}
                  placeholder="Enter check-in code"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCodeCheckIn}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Check'}
                </button>
              </div>
            </div>

            {/* Manual Email Check-in */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Manual Check-in
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleManualCheckIn)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleManualCheckIn}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Check'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  const allAttendees = attendees.filter(a => !checkedInUsers.has(a.id));
                  if (allAttendees.length > 0) {
                    setCheckedInUsers(prev => new Set([...prev, ...allAttendees.map(a => a.id)]));
                    setMessage(`✅ Checked in ${allAttendees.length} remaining attendees`);
                  }
                }}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Check All Remaining
              </button>
              <button
                onClick={() => {
                  setCheckedInUsers(new Set());
                  setMessage('✅ All check-ins cleared');
                }}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear All Check-ins
              </button>
            </div>
          </div>

          {/* Attendees List */}
          <div className="lg:w-2/3 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Registered Attendees</h3>
              <div className="text-sm text-gray-400">
                {checkedInCount} of {totalAttendees} checked in
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search attendees..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Attendees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredAttendees.map((attendee) => {
                const isCheckedIn = checkedInUsers.has(attendee.id);
                return (
                  <div
                    key={attendee.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCheckedIn
                        ? 'bg-green-900/30 border-green-600'
                        : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className={`font-medium ${isCheckedIn ? 'text-green-300' : 'text-white'}`}>
                          {attendee.name}
                        </div>
                        <div className="text-sm text-gray-400">{attendee.email}</div>
                        <div className="text-xs text-gray-500">
                          Registered: {new Date(attendee.registeredAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCheckedIn && (
                          <span className="text-green-400 text-sm font-medium">✓</span>
                        )}
                        <button
                          onClick={() => {
                            if (isCheckedIn) {
                              setCheckedInUsers(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(attendee.id);
                                return newSet;
                              });
                              setMessage(`❌ ${attendee.name} check-in removed`);
                            } else {
                              setCheckedInUsers(prev => new Set([...prev, attendee.id]));
                              setMessage(`✅ ${attendee.name} checked in successfully!`);
                            }
                          }}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            isCheckedIn
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isCheckedIn ? 'Remove' : 'Check In'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAttendees.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No attendees found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;