import { useState, useEffect } from 'react';
import './PasswordGate.css';

const PasswordGate = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('mindfuel_auth') === 'authenticated';
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validPasswords = [
    import.meta.env.VITE_DEMO_PASSWORD,
    import.meta.env.VITE_CLIENT_PASSWORD,
    import.meta.env.VITE_INVESTOR_PASSWORD,
  ].filter(Boolean);

  const shouldShowGate = validPasswords.length > 0;

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

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (validPasswords.includes(password.toLowerCase())) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mindfuel_auth', 'authenticated');
    } else {
      setError('Invalid password. Check with the team for access.');
    }

    setIsLoading(false);
  };

  if (!shouldShowGate || isAuthenticated) {
    return <div>{children}</div>;
  }

  return (
    <div className="gate">
      <div className="gate__panel">
        <header className="gate__brand">
          <img
            src="/Mindfuel_Glass_Logo.png"
            alt="Mindfuel"
            className="gate__logo"
            width={48}
            height={48}
          />
          <h1 className="gate__title">Mindfuel Prototype</h1>
          <p className="gate__meta">Demo access</p>
        </header>

        <form className="gate__form" onSubmit={handleSubmit} noValidate>
          <div className="gate__field">
            <label htmlFor="password" className="gate__label">
              Access password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="gate__input"
              placeholder="Enter password"
              required
              disabled={isLoading}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'gate-error' : undefined}
            />
          </div>

          {error ? (
            <div id="gate-error" className="gate__error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="gate__submit app-btn-solid"
            disabled={isLoading || !password.trim()}
            data-state={isLoading ? 'loading' : undefined}
            aria-busy={isLoading || undefined}
          >
            {isLoading ? (
              <>
                <svg
                  className="gate__spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    opacity="0.75"
                  />
                </svg>
                Checking…
              </>
            ) : (
              'Access prototype'
            )}
          </button>
        </form>

        <footer className="gate__footer">
          <p className="gate__contact">
            Need access?{' '}
            <a href="mailto:petermarkellis@gmail.com" className="gate__link">
              petermarkellis@gmail.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PasswordGate;
