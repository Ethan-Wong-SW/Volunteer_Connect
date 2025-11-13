import { useState } from 'react';
import './Login.css';

const KNOWN_USER = {
  email: 'ben@mail.com',
  password: 'test1234',
};

const Login = ({ onComplete }) => {
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    if (email === KNOWN_USER.email && password === KNOWN_USER.password) {
      setError('');
      onComplete?.();
      return;
    }

    setError("That email/password pair doesn't match our demo account.");
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-heading">
          <p className="login-eyebrow">Volunteer Connect</p>
          <h1>Log In</h1>
          <p className="login-subtext">
            For the demo, sign in as <strong>{KNOWN_USER.email}</strong> using password <strong>{KNOWN_USER.password}</strong>.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              className="login-input"
              type="email"
              name="email"
              defaultValue={KNOWN_USER.email}
              required
            />
          </label>

          <label htmlFor="login-password">
            Password
            <input
              id="login-password"
              className="login-input"
              type="password"
              name="password"
              defaultValue={KNOWN_USER.password}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit">Log In</button>
        </form>
      </div>
    </section>
  );
};

export default Login;
