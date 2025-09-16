import React, { useState, useEffect } from 'react';

const PasswordGate = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem('mindfuel_auth');
    if (stored === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Get valid passwords from environment variables
    const validPasswords = [
      import.meta.env.VITE_DEMO_PASSWORD,        // Main demo password
      import.meta.env.VITE_CLIENT_PASSWORD,      // For client reviews
      import.meta.env.VITE_INVESTOR_PASSWORD,    // For investor demos
    ].filter(Boolean); // Remove any undefined/empty passwords

    // Debug: Log environment variables (remove in production)
    console.log('Environment passwords loaded:', {
      demo: import.meta.env.VITE_DEMO_PASSWORD ? '✓' : '✗',
      client: import.meta.env.VITE_CLIENT_PASSWORD ? '✓' : '✗',
      investor: import.meta.env.VITE_INVESTOR_PASSWORD ? '✓' : '✗',
      total: validPasswords.length
    });

    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (validPasswords.includes(password.toLowerCase())) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mindfuel_auth', 'authenticated');
    } else {
      setError('Invalid password. Please check with the team for access.');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mindfuel_auth');
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <div>
        {/* Logout button - hidden in top right */}
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-3 py-1 rounded text-sm opacity-20 hover:opacity-100 transition-opacity"
          title="Logout"
        >
          🚪
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">MF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mindfuel Prototype
          </h1>
          <p className="text-gray-600 text-sm">
            Enter password to access the demo
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Access Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter password..."
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Access Prototype'
            )}
          </button>
        </form>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Need access? Contact{' '}
            <a 
              href="mailto:petermarkellis@gmail.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              petermarkellis@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
