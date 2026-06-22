import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import '../styles/auth.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Введите имя';
    if (!email.trim()) errs.email = 'Введите email';
    if (!password || password.length < 6) errs.password = 'Минимум 6 символов';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.register({ username: username.trim(), email: email.trim(), password });
      saveAuth(res.data.user, res.data.token, true);
      navigate('/');
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (err) => ({
    width: '100%',
    background: 'var(--surface)',
    border: `1.5px solid ${err ? 'var(--error)' : 'var(--border)'}`,
    borderRadius: 12,
    padding: '14px 16px',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 15,
    color: 'var(--text)'
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Создайте аккаунт для начала чтения</p>

        {globalError && <div className="auth-error">{globalError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Имя</label>
            <input
              type="text"
              value={username}
              placeholder="testuser"
              style={inputStyle(errors.username)}
              onChange={(e) => { setUsername(e.target.value); setErrors({ ...errors, username: '' }); }}
            />
            {errors.username && (
              <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{errors.username}</div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>E-Mail</label>
            <input
              type="email"
              value={email}
              placeholder="test@example.com"
              style={inputStyle(errors.email)}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
            />
            {errors.email && (
              <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{errors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Пароль</label>
            <input
              type="password"
              value={password}
              placeholder="Минимум 6 символов"
              style={inputStyle(errors.password)}
              onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
            />
            {errors.password && (
              <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#ffffff',
              color: '#111111',
              border: 'none',
              borderRadius: 50,
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 600,
              padding: 15,
              opacity: loading ? 0.7 : 1,
              marginBottom: 24,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth-bottom">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}