import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, stats } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Профиль</h2>

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 30, maxWidth: 440 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, marginBottom: 16 }}>
          {user.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{user.username}</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>{user.email}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Роль: {user.role}</div>

        {stats && (
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, display: 'block' }}>{stats.books_count}</span>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Книг</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, display: 'block' }}>{stats.clubs_count}</span>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Клубов</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, display: 'block' }}>{stats.messages_count}</span>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Сообщений</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}