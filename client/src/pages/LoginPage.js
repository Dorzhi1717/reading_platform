import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import '../styles/auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Введите email';
    if (!password) errs.password = 'Введите пароль';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim(), password });
      saveAuth(res.data.user, res.data.token, remember);
      navigate('/');
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (err) => ({
    width: '100%', background: 'var(--surface)',
    border: `1.5px solid ${err ? 'var(--error)' : 'var(--border)'}`,
    borderRadius: 12, padding: '14px 16px', outline: 'none',
    fontFamily: 'inherit', fontSize: 15, color: 'var(--text)'
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        <p className="auth-subtitle">Пожалуйста, введите ваши данные</p>

        {globalError && <div className="auth-error">{globalError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>E-Mail</label>
            <input type="email" value={email} placeholder="test@example.com" style={inputStyle(errors.email)}
              onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }} />
            {errors.email && <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{errors.email}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} placeholder="••••••••••••"
                style={{ ...inputStyle(errors.password), paddingRight: 44 }}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--muted)', padding: 4, fontSize: 18 }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{errors.password}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <label htmlFor="remember" style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>Запомнить меня</label>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#ffffff', color: '#111111', border: 'none', borderRadius: 50,
            fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: 15,
            opacity: loading ? 0.7 : 1, marginBottom: 24
          }}>{loading ? 'Вход...' : 'Войти'}</button>
        </form>

        <p className="auth-bottom">
          Еще нет аккаунта? <Link to="/register">Создать аккаунт</Link>
        </p>
      </div>
    </div>
  );
}